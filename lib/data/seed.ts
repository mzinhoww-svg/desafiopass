// lib/data/seed.ts
//
// Script de seed (npm run db:seed). Le lib/data/copa2026.ts e popula as tabelas
// teams e matches (DATA_SPEC secao 6). Idempotente: upsert por code (teams) e por
// id (matches), entao rodar 2x nao duplica e nao sobrescreve placar/status ja
// gravados. Insere teams antes de matches (FK home_code/away_code).
//
// kickoffAt vem como string ISO em UTC; convertido para Date. Nao reconverter
// timezone (DATA_SPEC: horarios ja estao em UTC no seed).

import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { teams, matches, users } from "../../drizzle/schema";
import { teams as seedTeams, matches as seedMatches } from "./copa2026";

// E-mails promovidos a admin (se ja existirem no banco). Nao altera a senha.
const ADMIN_EMAILS = ["mazinhoww@gmail.com"];

// Usuarios de teste (Task 1.1). Senha conhecida para validar login. Idempotente
// por email; o passwordHash e regravado a cada seed para manter a credencial estavel.
const testUsers = [
  {
    email: "admin@latampass.test",
    nickname: "AdminBolao",
    password: "bolao2026",
    role: "admin",
  },
  {
    email: "user@latampass.test",
    nickname: "Mazinho",
    password: "bolao2026",
    role: "user",
  },
];

async function main() {
  const db = drizzle(sql);

  // Selecoes (inclui placeholders de avanco com flagCode vazio).
  for (const t of seedTeams) {
    await db
      .insert(teams)
      .values({ code: t.code, name: t.name, flagCode: t.flagCode })
      .onConflictDoUpdate({
        target: teams.code,
        set: { name: t.name, flagCode: t.flagCode },
      });
  }

  // Partidas. Nao toca em homeScore/awayScore/status no conflito, para nao apagar
  // resultados ja lancados pelo admin numa reexecucao.
  for (const m of seedMatches) {
    await db
      .insert(matches)
      .values({
        id: m.id,
        phase: m.phase,
        grp: m.grp,
        homeCode: m.homeCode,
        awayCode: m.awayCode,
        stadium: m.stadium,
        kickoffAt: new Date(m.kickoffAt),
      })
      .onConflictDoUpdate({
        target: matches.id,
        set: {
          phase: m.phase,
          grp: m.grp,
          homeCode: m.homeCode,
          awayCode: m.awayCode,
          stadium: m.stadium,
          kickoffAt: new Date(m.kickoffAt),
        },
      });
  }

  // Usuarios de teste (Task 1.1).
  for (const u of testUsers) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await db
      .insert(users)
      .values({
        email: u.email,
        nickname: u.nickname,
        passwordHash,
        role: u.role,
      })
      .onConflictDoUpdate({
        target: users.email,
        set: { nickname: u.nickname, role: u.role, passwordHash },
      });
  }

  // Promove e-mails a admin, se ja existirem (nao altera senha).
  for (const email of ADMIN_EMAILS) {
    await db.update(users).set({ role: "admin" }).where(eq(users.email, email));
  }

  console.log(
    `Seed concluido: ${seedTeams.length} selecoes, ${seedMatches.length} partidas, ${testUsers.length} usuarios de teste.`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Falha no seed:", e);
    process.exit(1);
  });
