import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { leagues, leagueMembers, users } from "@/drizzle/schema";

export type LeagueRow = typeof leagues.$inferSelect;

// Quantas ligas o usuario participa (owner tambem e membro). Base do limite (DATA_SPEC 5).
export async function countUserLeagues(userId: string): Promise<number> {
  const rows = await db
    .select({ leagueId: leagueMembers.leagueId })
    .from(leagueMembers)
    .where(eq(leagueMembers.userId, userId));
  return rows.length;
}

export async function getLeagueById(id: string): Promise<LeagueRow | null> {
  const rows = await db.select().from(leagues).where(eq(leagues.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getLeagueByToken(token: string): Promise<LeagueRow | null> {
  if (!token) return null;
  const rows = await db
    .select()
    .from(leagues)
    .where(eq(leagues.inviteToken, token))
    .limit(1);
  return rows[0] ?? null;
}

export async function isMember(
  leagueId: string,
  userId: string,
): Promise<boolean> {
  const rows = await db
    .select({ userId: leagueMembers.userId })
    .from(leagueMembers)
    .where(
      and(eq(leagueMembers.leagueId, leagueId), eq(leagueMembers.userId, userId)),
    )
    .limit(1);
  return rows.length > 0;
}

export async function getLeagueMemberCount(leagueId: string): Promise<number> {
  const rows = await db
    .select({ userId: leagueMembers.userId })
    .from(leagueMembers)
    .where(eq(leagueMembers.leagueId, leagueId));
  return rows.length;
}

// Ligas que o usuario criou ou entrou (owner conta como membro), com nº de membros.
export async function getUserLeagues(
  userId: string,
): Promise<{ league: LeagueRow; members: number }[]> {
  const mine = await db
    .select({ leagueId: leagueMembers.leagueId })
    .from(leagueMembers)
    .where(eq(leagueMembers.userId, userId));
  const ids = mine.map((m) => m.leagueId);
  if (ids.length === 0) return [];

  const ls = await db.select().from(leagues).where(inArray(leagues.id, ids));
  const allMembers = await db
    .select({ leagueId: leagueMembers.leagueId })
    .from(leagueMembers)
    .where(inArray(leagueMembers.leagueId, ids));

  const counts = new Map<string, number>();
  for (const m of allMembers) {
    counts.set(m.leagueId, (counts.get(m.leagueId) ?? 0) + 1);
  }
  return ls.map((l) => ({ league: l, members: counts.get(l.id) ?? 0 }));
}

// --- Admin ---

export async function getAllLeaguesWithCounts(): Promise<
  { id: string; name: string; ownerNickname: string; members: number }[]
> {
  const rows = await db
    .select({
      id: leagues.id,
      name: leagues.name,
      ownerNickname: users.nickname,
    })
    .from(leagues)
    .innerJoin(users, eq(users.id, leagues.ownerId))
    .orderBy(asc(leagues.name));

  const allMembers = await db
    .select({ leagueId: leagueMembers.leagueId })
    .from(leagueMembers);
  const counts = new Map<string, number>();
  for (const m of allMembers) {
    counts.set(m.leagueId, (counts.get(m.leagueId) ?? 0) + 1);
  }
  return rows.map((r) => ({ ...r, members: counts.get(r.id) ?? 0 }));
}

export async function getLeagueMembersWithUsers(
  leagueId: string,
): Promise<{ userId: string; nickname: string }[]> {
  return db
    .select({ userId: leagueMembers.userId, nickname: users.nickname })
    .from(leagueMembers)
    .innerJoin(users, eq(users.id, leagueMembers.userId))
    .where(eq(leagueMembers.leagueId, leagueId))
    .orderBy(asc(users.nickname));
}
