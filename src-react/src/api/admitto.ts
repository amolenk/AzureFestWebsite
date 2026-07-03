import "server-only";

import { AdmittoError, PartnerRegistrationDetailDto, PublicTicketTypeDto, VerifyOtpResult } from "./admitto-types";
import { admittoSettings } from "../config/admitto-settings";

export { AdmittoError } from "./admitto-types";

export async function getTicketTypes(): Promise<PublicTicketTypeDto[]> {
  const url = `${getEventUrl()}/ticket-types`;
  const res = await fetch(url, { headers: getApiKeyHeaders() });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.detail || "Failed to fetch ticket types.");
  }
  return (await res.json()) as PublicTicketTypeDto[];
}

export async function requestOtp(email: string) {
  const url = `${getEventUrl()}/otp/request`;
  const res = await fetch(url, {
    method: "POST",
    headers: { ...getApiKeyHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.detail || "Verification request failed.");
  }
}

export async function verifyOtp(email: string, code: string): Promise<VerifyOtpResult> {
  const url = `${getEventUrl()}/otp/verify`;
  const res = await fetch(url, {
    method: "POST",
    headers: { ...getApiKeyHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ email, code })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.detail || "Verification failed.");
  }
  const data = await res.json();
  const token = typeof data === "string" ? data : (data.token ?? data.accessToken ?? data.registrationToken ?? "");

  return { token };
}

export async function resolveRegistrationIdByEmail(
  email: string,
  verificationToken: string
): Promise<string | null> {
  const params = new URLSearchParams({ email: email.trim() });
  const url = `${getEventUrl()}/registrations/resolve?${params.toString()}`;
  const res = await fetch(url, {
    headers: {
      ...getApiKeyHeaders(),
      Authorization: `Bearer ${verificationToken}`
    }
  });

  if (res.status === 404 || res.status === 204) {
    return null;
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new AdmittoError(
      errorData?.detail || "Failed to resolve registration.",
      errorData?.code ?? errorData?.errorCode,
      undefined,
      res.status
    );
  }

  const text = await res.text();
  if (!text) {
    return null;
  }

  let data: unknown;
  try {
    data = JSON.parse(text) as unknown;
  } catch {
    return text;
  }

  if (typeof data === "string") {
    return data;
  }

  if (typeof data === "object" && data !== null) {
    const registration = data as { registrationId?: string; id?: string };
    return registration.registrationId ?? registration.id ?? null;
  }

  return null;
}

export async function getRegistrationDetails(registrationId: string): Promise<PartnerRegistrationDetailDto> {
  const url = `${getEventUrl()}/registrations/${encodeURIComponent(registrationId)}`;
  const res = await fetch(url, {
    headers: getApiKeyHeaders()
  });

  if (res.status === 404) {
    throw new AdmittoError("Registration not found.", undefined, registrationId, 404);
  }

  if (!res.ok) {
    throw await admittoErrorFromResponse(res, "Failed to fetch registration details.");
  }

  return (await res.json()) as PartnerRegistrationDetailDto;
}

export async function updateRegistration(
  registrationId: string,
  firstName: string,
  lastName: string,
  ticketTypeIds: string[] | null,
  additionalDetails: Record<string, string>
) {
  const url = `${getEventUrl()}/registrations/${encodeURIComponent(registrationId)}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { ...getApiKeyHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName,
      lastName,
      ticketTypeIds,
      additionalDetails
    })
  });

  if (!res.ok) {
    throw await admittoErrorFromResponse(res, "Registration update failed.");
  }
}

export async function register(
  email: string,
  firstName: string,
  lastName: string,
  additionalDetails: Record<string, string>,
  registerTicketTypeIds: string[],
  waitlistTicketTypeIds: string[],
  verificationToken: string
) {
  const url = `${getEventUrl()}/registrations`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      ...getApiKeyHeaders(),
      "Content-Type": "application/json",
      Authorization: `Bearer ${verificationToken}`
    },
    body: JSON.stringify({
      email,
      firstName,
      lastName,
      additionalDetails,
      registerTicketTypeIds,
      waitlistTicketTypeIds
    })
  });
  if (!res.ok) {
    const errorData = await readAdmittoError(res);

    if (res.status === 409) {
      const conflict = typeof errorData === "string" ? {} : errorData;
      throw new AdmittoError(
        "You are already registered for this event. Check your email for your registration management link.",
        conflict.code ?? conflict.errorCode ?? "attendee.already_registered",
        conflict.registrationId,
        409
      );
    }

    throw admittoErrorFromData(errorData, res.status, "Registration failed.");
  }
  return true;
}

export async function cancel(registrationId: string) {
  const url = `${getEventUrl()}/registrations/${encodeURIComponent(registrationId)}/cancel`;
  const res = await fetch(url, {
    method: "POST",
    headers: getApiKeyHeaders()
  });
  if (!res.ok) {
    throw await admittoErrorFromResponse(res, "Cancellation failed.");
  }
}

export async function joinWaitlist(ticketTypeId: string, email: string, verificationToken?: string) {
  const url = `${getEventUrl()}/waitlist/${ticketTypeId}`;
  const headers: Record<string, string> = { ...getApiKeyHeaders(), "Content-Type": "application/json" };
  if (verificationToken) {
    headers["Authorization"] = `Bearer ${verificationToken}`;
  }
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ email })
  });
  if (!res.ok) {
    throw await admittoErrorFromResponse(res, "Failed to join waitlist.");
  }
}

export async function resendTicketConfirmation(registrationId: string) {
  const url = `${getEventUrl()}/registrations/${encodeURIComponent(registrationId)}/ticket-email/resend`;
  const res = await fetch(url, {
    method: "POST",
    headers: getApiKeyHeaders()
  });

  if (!res.ok) {
    throw await admittoErrorFromResponse(res, "Failed to resend ticket confirmation email.");
  }
}

async function admittoErrorFromResponse(res: Response, fallbackMessage: string): Promise<AdmittoError> {
  return admittoErrorFromData(await readAdmittoError(res), res.status, fallbackMessage);
}

async function readAdmittoError(res: Response): Promise<{ detail?: string; message?: string; code?: string; errorCode?: string; registrationId?: string } | string> {
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json") || contentType.includes("application/problem+json")) {
    return await res.json().catch(() => ({}));
  }

  return await res.text().catch(() => "");
}

function admittoErrorFromData(
  data: { detail?: string; message?: string; code?: string; errorCode?: string; registrationId?: string } | string,
  statusCode: number,
  fallbackMessage: string
): AdmittoError {
  if (typeof data === "string") {
    return new AdmittoError(data || fallbackMessage, undefined, undefined, statusCode);
  }

  return new AdmittoError(
    data.detail || data.message || fallbackMessage,
    data.code ?? data.errorCode,
    data.registrationId,
    statusCode
  );
}

function getEventUrl(): string {
  return `${admittoSettings.baseUrl}/api/events/${admittoSettings.eventSlug}`;
}

function getApiKeyHeaders(): Record<string, string> {
  return { "X-Api-Key": admittoSettings.apiKey };
}
