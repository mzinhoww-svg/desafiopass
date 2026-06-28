import { z } from "zod";

/*
 * Schemas Zod (DATA_SPEC secao 2). Validacao na borda de toda Server Action/rota.
 * zod 4: email no top-level (z.email()); literal(true) garante checkbox marcado.
 */
export const signupSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  nickname: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[A-Za-z0-9_]+$/),
  isAdult: z.literal(true), // checkbox 16+ obrigatorio
  acceptTerms: z.literal(true), // aceite obrigatorio
});

export type SignupInput = z.infer<typeof signupSchema>;

// Edicao de perfil (Task 1.3). favoriteTeam vazio = sem time (null no banco);
// quando preenchido, deve ser um codigo de selecao do seed (validado na action).
export const profileSchema = z.object({
  nickname: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[A-Za-z0-9_]+$/),
  favoriteTeam: z.string().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

// Palpite (Task 2.3). Range 0..20; a funcao de scoring assume entrada ja valida.
export const scoreSchema = z.object({
  homeGuess: z.number().int().min(0).max(20),
  awayGuess: z.number().int().min(0).max(20),
});

// Resultado inserido pelo admin (Task 2.4).
export const adminResultSchema = z.object({
  matchId: z.string(),
  homeScore: z.number().int().min(0).max(30),
  awayScore: z.number().int().min(0).max(30),
});
