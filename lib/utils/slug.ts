import { randomBytes } from "crypto";

// Token de convite de liga (DATA_SPEC secao 4). 16 bytes -> 22 chars base64url.
// Nao adivinhavel; a coluna invite_token e unique (colisao tratada com retry).
export function inviteToken(): string {
  return randomBytes(16).toString("base64url");
}
