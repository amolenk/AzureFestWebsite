import { AdmittoError } from "./admitto-types";

export function errorResponse(err: unknown) {
  const message = err instanceof Error ? err.message : "Admitto request failed.";
  const code = err instanceof AdmittoError ? err.code : undefined;
  const registrationId = err instanceof AdmittoError ? err.registrationId : undefined;

  return Response.json({ message, code, registrationId }, { status: 500 });
}
