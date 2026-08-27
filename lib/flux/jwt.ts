import { SignJWT } from "jose";

function getSecretBytes(): Uint8Array {
  const raw = process.env.FLUX_GATEWAY_JWT_SECRET ?? process.env.PGRST_JWT_SECRET;
  if (!raw) {
    throw new Error("FLUX_GATEWAY_JWT_SECRET (or PGRST_JWT_SECRET) is not set");
  }
  return new TextEncoder().encode(raw);
}

/** HS256 JWT for PostgREST / Flux gateway: `sub` must match row `user_id`. */
export async function mintFluxJwt(sub: string): Promise<string> {
  const secret = getSecretBytes();
  return new SignJWT({ role: "authenticated" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);
}
