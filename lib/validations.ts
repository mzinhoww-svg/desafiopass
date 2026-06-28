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
