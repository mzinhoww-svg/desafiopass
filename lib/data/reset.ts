// lib/data/reset.ts
//
// Script de limpeza para o lancamento (npm run db:reset). Deixa o banco em estado
// limpo: remove TODAS as ligas e palpites e remove todos os usuarios, exceto os
// e-mails em KEEP_EMAILS (mantidos e promovidos a admin). Roda via workflow do
// GitHub Actions (egress livre ao Neon). Idempotente.
//
// CUIDADO: apaga dados de producao. Use apenas no lancamento / reset deliberado.

import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql as client } from "@vercel/postgres";
import { inArray, notInArray, sql } from "drizzle-orm";
import {
  users,
  leagues,
  leagueMembers,
  predictions,
  specialPredictions,
} from "../../drizzle/schema";

// Usuarios preservados (nao apagados) e garantidos como admin.
const KEEP_EMAILS = ["mazinhoww@gmail.com"];

async function main() {
  const db = drizzle(client);
  const keep = KEEP_EMAILS.map((e) => e.toLowerCase());

  // Ordem segura para as FKs: dependentes primeiro, usuarios por ultimo.
  await db.delete(leagueMembers);
  await db.delete(leagues);
  await db.delete(specialPredictions);
  await db.delete(predictions);

  // Remove todos os usuarios fora da allowlist (case-insensitive). inArray/
  // notInArray parametrizam cada item (x in ($1, $2, ...)), evitando o bind de
  // array unico que o driver rejeita.
  const emailLower = sql`lower(${users.email})`;
  await db.delete(users).where(notInArray(emailLower, keep));

  // Garante que os preservados sejam admin (nao cria conta nova).
  await db.update(users).set({ role: "admin" }).where(inArray(emailLower, keep));

  const remaining = await db.select({ id: users.id }).from(users);
  console.log(
    `Reset concluido: ligas e palpites apagados, ${remaining.length} usuario(s) mantido(s).`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Falha no reset:", e);
    process.exit(1);
  });
