// lib/db.ts
//
// Cliente Drizzle sobre Vercel Postgres (ESTRUTURA.md). O driver @vercel/postgres
// le a connection string de POSTGRES_URL no ambiente. Toda leitura/escrita do app
// usa este `db`; nunca acesso direto ao banco do client.

import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import * as schema from "@/drizzle/schema";

export const db = drizzle(sql, { schema });
