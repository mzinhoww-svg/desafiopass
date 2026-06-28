import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Carrega variaveis locais (.env.local tem prioridade; .env como fallback).
// db:generate nao conecta ao banco; db:migrate e db:studio usam POSTGRES_URL.
config({ path: ".env.local" });
config();

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    // Placeholder permite `db:generate` sem banco; `db:migrate` exige a URL real.
    url: process.env.POSTGRES_URL ?? "postgres://placeholder",
  },
});
