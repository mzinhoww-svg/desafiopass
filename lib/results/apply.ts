// lib/results/apply.ts
//
// Lógica compartilhada de aplicação de resultado, usada tanto pelo admin manual
// (closeMatch) quanto pela sincronização automática via API (#1/#6). Encerra a
// partida, avança o chaveamento, pontua os palpites e notifica por e-mail.

import { and, eq, inArray, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { matches, predictions, users } from "@/drizzle/schema";
import { finalPoints, type Phase } from "@/lib/scoring";
import { advancement } from "@/lib/data/copa2026";
import { getMyGlobalRank } from "@/lib/queries/ranking";
import { sendEmail, appUrl } from "@/lib/email/client";
import { resultEmail } from "@/lib/email/templates";
import { pushToUsersLocalized } from "@/lib/push/notify";
import { applySpecialResults } from "@/lib/results/special";

// Propaga o vencedor (ou perdedor, p/ 3º lugar) para o confronto seguinte (#1).
// Recebe vencedor/perdedor já resolvidos (pelo placar OU pela escolha do admin,
// no caso de empate decidido nos pênaltis).
async function propagateWinner(
  matchId: string,
  winner: string | null,
  loser: string | null,
) {
  for (const [placeholder, info] of Object.entries(advancement)) {
    if (info.fromMatch !== matchId) continue;
    const resolved = info.takes === "winner" ? winner : loser;
    if (!resolved) continue;
    await db
      .update(matches)
      .set({ homeCode: resolved })
      .where(eq(matches.homeCode, placeholder));
    await db
      .update(matches)
      .set({ awayCode: resolved })
      .where(eq(matches.awayCode, placeholder));
  }
}

// E-mail de resultado (#6) para quem palpitou e aceita receber e-mails.
async function notifyResults(
  matchLabel: string,
  scoreLabel: string,
  scored: { userId: string; guessLabel: string; points: number }[],
) {
  if (scored.length === 0) return;
  const ids = scored.map((s) => s.userId);
  const recipients = await db
    .select({
      id: users.id,
      email: users.email,
      nickname: users.nickname,
      emailReminders: users.emailReminders,
      locale: users.locale,
    })
    .from(users)
    .where(inArray(users.id, ids));
  const byId = new Map(recipients.map((r) => [r.id, r]));
  const rankingUrl = `${appUrl()}/ranking`;

  for (const s of scored) {
    const u = byId.get(s.userId);
    if (!u || !u.emailReminders) continue;
    const rank = await getMyGlobalRank(u.id);
    const mail = resultEmail({
      nickname: u.nickname,
      matchLabel,
      scoreLabel,
      guessLabel: s.guessLabel,
      points: s.points,
      position: rank?.position ?? null,
      rankingUrl,
      locale: u.locale === "es" ? "es" : "pt",
    });
    await sendEmail({
      to: u.email,
      toName: u.nickname,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
  }
}

/*
 * Aplica o resultado final de uma partida: grava placar + status encerrada,
 * avança o chaveamento, pontua todos os palpites e notifica. Idempotente
 * (recalcula e sobrescreve). Retorna quantos palpites foram pontuados, ou null
 * se a partida não existe.
 *
 * winnerCode (opcional): no mata-mata, um jogo pode terminar empatado no tempo
 * normal e ser decidido nos pênaltis (ex.: 0x0 com o Canadá avançando). Quando o
 * admin informa quem avançou, esse código tem prioridade sobre o placar para o
 * chaveamento e para o campeão — sem alterar a pontuação dos palpites, que segue
 * o placar do tempo normal.
 */
export async function applyResult(
  matchId: string,
  homeScore: number,
  awayScore: number,
  winnerCode?: string | null,
): Promise<{ scored: number } | null> {
  const match = (
    await db.select().from(matches).where(eq(matches.id, matchId)).limit(1)
  )[0];
  if (!match) return null;

  const isBrazilMatch = match.homeCode === "BRA" || match.awayCode === "BRA";

  await db
    .update(matches)
    .set({ homeScore, awayScore, status: "encerrada" })
    .where(eq(matches.id, matchId));

  // Vencedor para o chaveamento: a escolha do admin (penâltis) tem prioridade;
  // na ausência, decide pelo placar (null em empate => nada avança).
  const override =
    winnerCode && (winnerCode === match.homeCode || winnerCode === match.awayCode)
      ? winnerCode
      : null;
  const scoreWinner =
    homeScore > awayScore
      ? match.homeCode
      : awayScore > homeScore
        ? match.awayCode
        : null;
  const winner = override ?? scoreWinner;
  const loser = winner
    ? winner === match.homeCode
      ? match.awayCode
      : match.homeCode
    : null;

  await propagateWinner(matchId, winner, loser);

  const preds = await db
    .select()
    .from(predictions)
    .where(eq(predictions.matchId, matchId));

  const scored: { userId: string; guessLabel: string; points: number }[] = [];
  for (const p of preds) {
    const breakdown = finalPoints({
      guess: { homeGuess: p.homeGuess, awayGuess: p.awayGuess },
      result: { homeScore, awayScore },
      phase: match.phase as Phase,
      isBrazilMatch,
    });
    await db
      .update(predictions)
      .set({ points: breakdown.final, criterion: breakdown.criterion })
      .where(eq(predictions.id, p.id));
    scored.push({
      userId: p.userId,
      guessLabel: `${p.homeGuess} x ${p.awayGuess}`,
      points: breakdown.final,
    });
  }

  // Campeão (palpites especiais #2): ao encerrar a FINAL, define o campeão pelo
  // vencedor resolvido (placar ou escolha do admin nos pênaltis) e recalcula. O
  // artilheiro fica a cargo da sincronização pela API (não sobrescreve aqui).
  if (match.phase === "final" && winner) {
    try {
      await applySpecialResults({ champion: winner });
    } catch (e) {
      console.error("[results] falha ao definir campeão:", e);
    }
  }

  const matchLabel = `${match.homeCode} x ${match.awayCode}`;
  const scoreLabel = `${homeScore} x ${awayScore}`;

  try {
    await notifyResults(matchLabel, scoreLabel, scored);
  } catch (e) {
    console.error("[results] falha ao notificar e-mail:", e);
  }

  // Push para quem palpitou (#4), no idioma de cada um.
  try {
    await pushToUsersLocalized(
      scored.map((s) => s.userId),
      {
        pt: {
          title: "Resultado saiu!",
          body: `${matchLabel} terminou ${scoreLabel}. Veja seus pontos.`,
          url: "/ranking",
        },
        es: {
          title: "¡Salió el resultado!",
          body: `${matchLabel} terminó ${scoreLabel}. Mira tus puntos.`,
          url: "/ranking",
        },
      },
    );
  } catch (e) {
    console.error("[results] falha ao notificar push:", e);
  }

  return { scored: preds.length };
}

// Atualiza placar parcial e marca como 'ao_vivo' (#6), sem pontuar. Só age se a
// partida ainda não estiver encerrada (não sobrescreve resultado final).
export async function setLiveScore(
  matchId: string,
  homeScore: number,
  awayScore: number,
) {
  await db
    .update(matches)
    .set({ homeScore, awayScore, status: "ao_vivo" })
    .where(and(eq(matches.id, matchId), ne(matches.status, "encerrada")));
}

// Atualiza dados de agenda da partida pela API (horário e/ou estádio). Só em jogos
// ainda não encerrados (o prazo de palpite acompanha o novo kickoff).
export async function updateSchedule(
  matchId: string,
  fields: { kickoffAt?: Date; stadium?: string },
) {
  if (Object.keys(fields).length === 0) return;
  await db
    .update(matches)
    .set(fields)
    .where(and(eq(matches.id, matchId), ne(matches.status, "encerrada")));
}
