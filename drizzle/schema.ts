// drizzle/schema.ts
//
// Schema Drizzle do Bolao LATAM Pass. Implementa specs/DATA_SPEC.md ao pe da letra:
// mesmas tabelas, colunas, tipos e constraints. A unica adaptacao e a sintaxe do
// segundo argumento do pgTable (array em vez de objeto), exigida pelo drizzle-orm
// 0.45 (a forma de objeto foi deprecada na 0.36). Decisao registrada no backlog.
//
// Regras travadas (DATA_SPEC 1.1):
// - kickoffAt withTimezone, sempre UTC.
// - predictions.unique(user_id, match_id) garante um palpite por partida (upsert usa).
// - predictions.criterion gravado junto com points ao encerrar (Opcao A do RANKING_SPEC).
// - onDelete cascade em predictions e league_members evita orfaos.
// - Nenhuma coluna cacheia total de pontos; total e sempre agregado por query.

import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  primaryKey,
  unique,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  nickname: text("nickname").notNull().unique(),
  favoriteTeam: text("favorite_team"), // codigo do team, null permitido
  avatarUrl: text("avatar_url"), // data URL (imagem redimensionada), null permitido
  role: text("role").notNull().default("user"), // 'user' | 'admin'
  isPremium: boolean("is_premium").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const teams = pgTable("teams", {
  code: text("code").primaryKey(), // ex 'BRA'
  name: text("name").notNull(),
  flagCode: text("flag_code").notNull(), // codigo do SVG em /public/flags (ex 'br')
});

export const matches = pgTable(
  "matches",
  {
    id: text("id").primaryKey(), // id do seed, ex 'R16-01'
    phase: text("phase").notNull(), // ver Phase em SCORING_SPEC
    grp: text("grp"), // grupo, null no mata-mata
    homeCode: text("home_code")
      .notNull()
      .references(() => teams.code),
    awayCode: text("away_code")
      .notNull()
      .references(() => teams.code),
    stadium: text("stadium").notNull(),
    kickoffAt: timestamp("kickoff_at", { withTimezone: true }).notNull(), // UTC. Prazo.
    homeScore: integer("home_score"), // null ate encerrar
    awayScore: integer("away_score"),
    status: text("status").notNull().default("agendada"), // 'agendada'|'ao_vivo'|'encerrada'
  },
  (t) => [
    index("matches_phase_idx").on(t.phase),
    index("matches_kickoff_idx").on(t.kickoffAt),
  ],
);

export const predictions = pgTable(
  "predictions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    matchId: text("match_id")
      .notNull()
      .references(() => matches.id),
    homeGuess: integer("home_guess").notNull(), // 0..20 (validado por Zod)
    awayGuess: integer("away_guess").notNull(),
    points: integer("points").notNull().default(0), // gravado ao encerrar
    criterion: text("criterion"), // gravado ao encerrar (RANKING_SPEC 8.4, Opcao A)
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique("predictions_user_match_uq").on(t.userId, t.matchId), // um palpite por partida
    index("predictions_match_idx").on(t.matchId),
    index("predictions_user_idx").on(t.userId),
  ],
);

export const leagues = pgTable("leagues", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id),
  inviteToken: text("invite_token").notNull().unique(), // crypto, nao adivinhavel
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const leagueMembers = pgTable(
  "league_members",
  {
    leagueId: uuid("league_id")
      .notNull()
      .references(() => leagues.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.leagueId, t.userId] }), // membro unico por liga
    index("league_members_user_idx").on(t.userId),
  ],
);

// Schema agora, UI em V2. Nao implementar fluxo, so existir.
export const specialPredictions = pgTable(
  "special_predictions",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // 'campeao' | 'artilheiro'
    value: text("value").notNull(), // codigo do team ou nome do jogador
    points: integer("points").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.userId, t.type] })],
);
