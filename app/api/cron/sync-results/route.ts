import { NextResponse } from "next/server";
import { syncResults } from "@/lib/results/sync";

/*
 * Sincronização automática de resultados (#1/#6). Disparado por cron (Vercel Cron
 * envia Authorization: Bearer CRON_SECRET). Busca os jogos na API pública e
 * encerra/pontua os finalizados, além de atualizar os ao vivo.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const r = await syncResults();
  return NextResponse.json(r);
}
