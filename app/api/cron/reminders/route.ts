import { NextResponse } from "next/server";
import { and, eq, gt, lt, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { matches, predictions, users } from "@/drizzle/schema";
import { sendEmail, appUrl } from "@/lib/email/client";
import { reminderEmail } from "@/lib/email/templates";
import { formatBrasilia } from "@/lib/utils/dates";

/*
 * Lembrete de palpites pendentes (#5). Disparado por cron (Vercel Cron envia
 * Authorization: Bearer CRON_SECRET). Para cada jogo agendado que comeca dentro
 * da janela, envia 1 e-mail por usuario (que aceita lembretes) listando os jogos
 * que ele ainda nao palpitou. Idempotente o suficiente para a cadencia diaria.
 */
export const dynamic = "force-dynamic";

const WINDOW_HOURS = 30;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const until = new Date(now.getTime() + WINDOW_HOURS * 60 * 60 * 1000);

  const windowMatches = await db
    .select({
      id: matches.id,
      homeCode: matches.homeCode,
      awayCode: matches.awayCode,
      kickoffAt: matches.kickoffAt,
    })
    .from(matches)
    .where(
      and(
        eq(matches.status, "agendada"),
        gt(matches.kickoffAt, now),
        lt(matches.kickoffAt, until),
      ),
    );

  if (windowMatches.length === 0) {
    return NextResponse.json({ sent: 0, reason: "no_matches_in_window" });
  }

  const matchIds = windowMatches.map((m) => m.id);

  const [recipients, preds] = await Promise.all([
    db
      .select({ id: users.id, email: users.email, nickname: users.nickname })
      .from(users)
      .where(eq(users.emailReminders, true)),
    db
      .select({ userId: predictions.userId, matchId: predictions.matchId })
      .from(predictions)
      .where(inArray(predictions.matchId, matchIds)),
  ]);

  // Set de "ja palpitou" por usuario+jogo.
  const done = new Set(preds.map((p) => `${p.userId}:${p.matchId}`));
  const matchesUrl = `${appUrl()}/partidas`;

  let sent = 0;
  for (const user of recipients) {
    const pending = windowMatches.filter((m) => !done.has(`${user.id}:${m.id}`));
    if (pending.length === 0) continue;

    const mail = reminderEmail({
      nickname: user.nickname,
      matchesUrl,
      games: pending.map((m) => ({
        label: `${m.homeCode} x ${m.awayCode}`,
        when: formatBrasilia(new Date(m.kickoffAt)),
      })),
    });
    const r = await sendEmail({
      to: user.email,
      toName: user.nickname,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
    if (r.ok) sent++;
  }

  return NextResponse.json({ sent, candidates: recipients.length });
}
