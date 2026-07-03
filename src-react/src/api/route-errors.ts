import { AdmittoError } from "./admitto-types";

export function errorResponse(err: unknown) {
  const message = err instanceof Error ? err.message : "Admitto request failed.";
  const code = err instanceof AdmittoError ? err.code : undefined;
  const registrationId = err instanceof AdmittoError ? err.registrationId : undefined;
  const statusCode = err instanceof AdmittoError ? (err.statusCode ?? 500) : 500;
  const status = statusCode >= 400 && statusCode <= 599 ? statusCode : 500;
  const body: { message: string; code?: string; registrationId?: string } = { message };

  if (code) {
    body.code = code;
  }

  if (registrationId) {
    body.registrationId = registrationId;
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
