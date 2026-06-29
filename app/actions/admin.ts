"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { matches, leagues, leagueMembers, users } from "@/drizzle/schema";
import { isAdmin, getCurrentUser } from "@/lib/auth-helpers";
import { adminResultSchema, updateMatchSchema } from "@/lib/validations";
import { teams as seedTeams } from "@/lib/data/copa2026";
import { applyResult } from "@/lib/results/apply";
import { syncResults } from "@/lib/results/sync";

const allTeamCodes = new Set(seedTeams.map((t) => t.code));

/*
 * Admin encerra a partida e pontua (Task 2.4). Delega para applyResult (lógica
 * compartilhada com a sincronização automática): grava placar + status encerrada,
 * avança o chaveamento, pontua os palpites e notifica. Idempotente.
 */
export type AdminState = { error?: string; ok?: boolean; scored?: number };

export async function closeMatch(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  if (!(await isAdmin())) return { error: "Acesso restrito a admin." };

  const parsed = adminResultSchema.safeParse({
    matchId: String(formData.get("matchId") ?? ""),
    homeScore: Number(formData.get("homeScore")),
    awayScore: Number(formData.get("awayScore")),
  });
  if (!parsed.success) return { error: "Placar invalido (inteiros de 0 a 30)." };

  const { matchId, homeScore, awayScore } = parsed.data;
  const res = await applyResult(matchId, homeScore, awayScore);
  if (!res) return { error: "Partida nao encontrada." };

  revalidatePath(`/admin/partidas/${matchId}`);
  revalidatePath(`/partidas/${matchId}`);
  revalidatePath("/partidas");
  revalidatePath("/ranking");
  return { ok: true, scored: res.scored };
}

/*
 * Sincroniza resultados pela API pública (#1). Acionável pelo admin (botão) e
 * pelo cron. Encerra/pontua os jogos finalizados e atualiza os ao vivo.
 */
export type SyncState = { error?: string; ok?: boolean; message?: string };

export async function syncResultsAction(
  _prev: SyncState,
  _formData: FormData,
): Promise<SyncState> {
  void _prev;
  void _formData;
  if (!(await isAdmin())) return { error: "Acesso restrito a admin." };
  try {
    const r = await syncResults();
    revalidatePath("/admin");
    revalidatePath("/partidas");
    revalidatePath("/ranking");
    if (r.skipped) {
      return { error: "Sincronização indisponível (sem chave da API configurada)." };
    }
    return {
      ok: true,
      message:
        `${r.finished} jogo(s) encerrado(s), ${r.live} ao vivo.` +
        (r.specialApplied ? " Campeão e artilheiro definidos." : ""),
    };
  } catch (e) {
    console.error("[admin] sync falhou:", e);
    return { error: "Falha ao sincronizar. Veja os logs." };
  }
}

/*
 * Admin edita uma partida (#2): horario (Brasilia), estadio e seleções. Permite
 * corrigir data/hora (o prazo de palpite acompanha) e resolver manualmente
 * confrontos (ex.: empate no mata-mata definido nos penaltis). Nao altera placar.
 */
export async function updateMatch(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  if (!(await isAdmin())) return { error: "Acesso restrito a admin." };

  const parsed = updateMatchSchema.safeParse({
    matchId: String(formData.get("matchId") ?? ""),
    kickoffLocal: String(formData.get("kickoffLocal") ?? ""),
    stadium: String(formData.get("stadium") ?? "").trim(),
    homeCode: String(formData.get("homeCode") ?? "").trim(),
    awayCode: String(formData.get("awayCode") ?? "").trim(),
  });
  if (!parsed.success) return { error: "Dados da partida inválidos." };

  const { matchId, kickoffLocal, stadium, homeCode, awayCode } = parsed.data;
  if (!allTeamCodes.has(homeCode) || !allTeamCodes.has(awayCode)) {
    return { error: "Seleção inválida." };
  }
  // datetime-local nao tem fuso; interpretamos como horario de Brasilia (UTC-3).
  const kickoffAt = new Date(`${kickoffLocal}:00-03:00`);
  if (Number.isNaN(kickoffAt.getTime())) return { error: "Data/hora inválida." };

  await db
    .update(matches)
    .set({ kickoffAt, stadium: stadium || "A confirmar", homeCode, awayCode })
    .where(eq(matches.id, matchId));

  revalidatePath(`/admin/partidas/${matchId}`);
  revalidatePath(`/partidas/${matchId}`);
  revalidatePath("/partidas");
  return { ok: true };
}

// --- Gestao admin (excluir usuario/liga, remover membro). Form actions. ---

export async function deleteUser(formData: FormData): Promise<void> {
  const current = await getCurrentUser();
  if (current?.role !== "admin") return;
  const userId = String(formData.get("userId") ?? "");
  if (!userId || userId === current.id) return; // nao exclui a si mesmo
  // Remove primeiro as ligas que o usuario e dono (cascata nos membros). Depois o
  // usuario, que cascateia predictions e league_members dele.
  await db.delete(leagues).where(eq(leagues.ownerId, userId));
  await db.delete(users).where(eq(users.id, userId));
  revalidatePath("/admin/usuarios");
  revalidatePath("/admin/ligas");
  revalidatePath("/ranking");
}

export async function deleteLeague(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const leagueId = String(formData.get("leagueId") ?? "");
  if (!leagueId) return;
  // Cascata remove os league_members da liga.
  await db.delete(leagues).where(eq(leagues.id, leagueId));
  revalidatePath("/admin/ligas");
}

export async function removeMember(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const leagueId = String(formData.get("leagueId") ?? "");
  const userId = String(formData.get("userId") ?? "");
  if (!leagueId || !userId) return;
  await db
    .delete(leagueMembers)
    .where(
      and(
        eq(leagueMembers.leagueId, leagueId),
        eq(leagueMembers.userId, userId),
      ),
    );
  revalidatePath(`/admin/ligas/${leagueId}`);
}
