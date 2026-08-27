import { configuredAuthProviderIds } from "@/lib/config/env";

export function isFluxPersistenceConfigured(): boolean {
  return Boolean(process.env.FLUX_URL?.trim() && process.env.FLUX_GATEWAY_JWT_SECRET?.trim());
}

export function oauthProviderIds(): Array<"github" | "google"> {
  return configuredAuthProviderIds();
}

export type R2Env = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBaseUrl?: string;
};

export function readR2Env(): R2Env | null {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.R2_BUCKET_NAME?.trim();
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) return null;
  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucket,
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL?.trim() || undefined,
  };
}

export function isR2Configured(): boolean {
  return readR2Env() !== null;
}
