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

export async function getRegistrationDetailsByEmail(
  email: string,
  verificationToken: string
): Promise<PartnerRegistrationDetailDto | null> {
  const params = new URLSearchParams({ email: email.trim() });
  const url = `${getEventUrl()}/registrations?${params.toString()}`;
  const res = await fetch(url, {
    headers: {
      ...getApiKeyHeaders(),
      Authorization: `Bearer ${verificationToken}`
    }
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new AdmittoError(
      errorData?.detail || "Failed to fetch registration details.",
      errorData?.code ?? errorData?.errorCode
    );
  }

  return (await res.json()) as PartnerRegistrationDetailDto;
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
    const errorData = await res.json().catch(() => ({}));

    if (res.status === 409) {
      throw new AdmittoError(
        "You are already registered for this event. Check your email for your registration management link.",
        errorData?.code ?? errorData?.errorCode ?? "attendee.already_registered"
      );
    }

    throw new AdmittoError(
      errorData?.detail || "Registration failed.",
      errorData?.code ?? errorData?.errorCode
    );
  }
  return true;
}

export async function cancel(registrationId: string) {
  const url = `${getEventUrl()}/registrations/${registrationId}/cancel`;
  const res = await fetch(url, {
    method: "POST",
    headers: getApiKeyHeaders()
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.detail || "Cancellation failed.");
  }
}

export async function changeTickets(registrationId: string, ticketTypeIds: string[]) {
  const url = `${getEventUrl()}/registrations/${registrationId}/tickets`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { ...getApiKeyHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ ticketTypeIds })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new AdmittoError(
      errorData?.detail || "Registration update failed.",
      errorData?.code ?? errorData?.errorCode
    );
  }
  return true;
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
    const errorData = await res.json().catch(() => ({}));
    throw new AdmittoError(errorData?.detail || "Failed to join waitlist.", errorData?.code ?? errorData?.errorCode);
  }
}

export async function resendTicketConfirmation(registrationId: string) {
  const url = `${getEventUrl()}/registrations/${registrationId}/ticket-email/resend`;
  const res = await fetch(url, {
    method: "POST",
    headers: getApiKeyHeaders()
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.detail || "Failed to resend ticket confirmation email.");
  }
}

function getEventUrl(): string {
  return `${admittoSettings.baseUrl}/api/events/${admittoSettings.eventSlug}`;
}

function getApiKeyHeaders(): Record<string, string> {
  return { "X-Api-Key": admittoSettings.apiKey };
}
