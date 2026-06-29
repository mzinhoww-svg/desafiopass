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
import { pushToUsers } from "@/lib/push/notify";

// Propaga o vencedor (ou perdedor, p/ 3º lugar) para o confronto seguinte (#1).
async function propagateWinner(
  matchId: string,
  homeCode: string,
  awayCode: string,
  homeScore: number,
  awayScore: number,
) {
  const winner =
    homeScore > awayScore ? homeCode : awayScore > homeScore ? awayCode : null;
  const loser =
    homeScore > awayScore ? awayCode : awayScore > homeScore ? homeCode : null;

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
 */
export async function applyResult(
  matchId: string,
  homeScore: number,
  awayScore: number,
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

  await propagateWinner(matchId, match.homeCode, match.awayCode, homeScore, awayScore);

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

  const matchLabel = `${match.homeCode} x ${match.awayCode}`;
  const scoreLabel = `${homeScore} x ${awayScore}`;

  try {
    await notifyResults(matchLabel, scoreLabel, scored);
  } catch (e) {
    console.error("[results] falha ao notificar e-mail:", e);
  }

  // Push para quem palpitou (#4).
  try {
    await pushToUsers(
      scored.map((s) => s.userId),
      {
        title: "Resultado saiu!",
        body: `${matchLabel} terminou ${scoreLabel}. Veja seus pontos.`,
        url: "/ranking",
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
