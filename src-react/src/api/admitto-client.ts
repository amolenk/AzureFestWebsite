import { AdmittoError, PartnerRegistrationDetailDto, PublicTicketTypeDto, VerifyOtpResult } from "./admitto-types";

export { AdmittoError } from "./admitto-types";

export async function getTicketTypes(vipCode?: string): Promise<PublicTicketTypeDto[]> {
  return await request<PublicTicketTypeDto[]>(withVipCode("/api/admitto/ticket-types", vipCode));
}

export async function requestOtp(email: string, vipCode?: string) {
  await request(withVipCode("/api/admitto/otp/request", vipCode), {
    method: "POST",
    body: JSON.stringify({ email })
  });
}

export async function verifyOtp(email: string, code: string, vipCode?: string): Promise<VerifyOtpResult> {
  return await request<VerifyOtpResult>(withVipCode("/api/admitto/otp/verify", vipCode), {
    method: "POST",
    body: JSON.stringify({ email, code })
  });
}

export async function getRegistrationDetailsByEmail(
  email: string,
  verificationToken: string,
  vipCode?: string
): Promise<PartnerRegistrationDetailDto | null> {
  const params = new URLSearchParams({ email: email.trim() });
  if (vipCode) {
    params.set("vip", vipCode);
  }
  return await request<PartnerRegistrationDetailDto | null>(`/api/admitto/registrations?${params.toString()}`, {
    headers: { Authorization: `Bearer ${verificationToken}` }
  });
}

export async function register(
  email: string,
  firstName: string,
  lastName: string,
  additionalDetails: Record<string, string>,
  registerTicketTypeIds: string[],
  waitlistTicketTypeIds: string[],
  verificationToken: string,
  vipCode?: string
) {
  await request(withVipCode("/api/admitto/register", vipCode), {
    method: "POST",
    body: JSON.stringify({
      email,
      firstName,
      lastName,
      additionalDetails,
      registerTicketTypeIds,
      waitlistTicketTypeIds,
      verificationToken
    })
  });
}

export async function cancel(registrationId: string) {
  await request(`/api/admitto/registrations/${encodeURIComponent(registrationId)}/cancel`, {
    method: "POST"
  });
}

export async function changeTickets(registrationId: string, ticketTypeIds: string[]) {
  await request(`/api/admitto/registrations/${encodeURIComponent(registrationId)}/tickets`, {
    method: "PUT",
    body: JSON.stringify({ ticketTypeIds })
  });
}

export async function joinWaitlist(ticketTypeId: string, email: string, verificationToken: string, vipCode?: string) {
  await request(withVipCode("/api/admitto/waitlist", vipCode), {
    method: "POST",
    body: JSON.stringify({ ticketTypeId, email, verificationToken })
  });
}

export async function resendTicketConfirmation(registrationId: string) {
  await request(`/api/admitto/registrations/${encodeURIComponent(registrationId)}/ticket-email/resend`, {
    method: "POST"
  });
}

async function request<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new AdmittoError(
      data?.message || data?.detail || "Admitto request failed.",
      data?.code ?? data?.errorCode,
      data?.registrationId
    );
  }

  return data as T;
}

function withVipCode(url: string, vipCode?: string): string {
  if (!vipCode) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}vip=${encodeURIComponent(vipCode)}`;
}
