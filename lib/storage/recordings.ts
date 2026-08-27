import { UserFacingError } from "@/lib/flux/errors";
import { isR2Configured } from "@/lib/config/availability";

export type RecordingUpload = {
  title: string;
  bytes: Uint8Array;
  contentType: string;
};

/**
 * Recordings object storage. Bytes would go to R2; this module never reports
 * success unless a real upload path is wired. No HTTP client here — Foundry
 * allows Flux fetch only through lib/flux/client.ts.
 */
export function assertRecordingsAvailable(): void {
  if (!isR2Configured()) {
    throw new UserFacingError(
      "Cloud recordings are not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME.",
    );
  }
}

export function describeRecordingsStatus(): {
  configured: boolean;
  detail: string;
} {
  if (!isR2Configured()) {
    return {
      configured: false,
      detail:
        "R2 credentials are not set. The tuner works without them. Cloud recording save is disabled.",
    };
  }
  return {
    configured: true,
    detail:
      "R2 env is present, but the upload client is not wired in this build. Saves remain disabled until that work ships.",
  };
}

export function uploadRecording(_input: RecordingUpload): never {
  assertRecordingsAvailable();
  throw new UserFacingError(
    "Recording upload is not implemented yet. R2 env is reserved; nothing was saved.",
  );
}
