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

export async function resolveRegistrationIdByEmail(
  email: string,
  verificationToken: string,
  vipCode?: string
): Promise<string | null> {
  const params = new URLSearchParams({ email: email.trim() });
  if (vipCode) {
    params.set("vip", vipCode);
  }
  const result = await request<{ registrationId: string | null }>(`/api/admitto/registrations?${params.toString()}`, {
    headers: { Authorization: `Bearer ${verificationToken}` }
  });

  return result.registrationId;
}

export async function getRegistrationDetails(registrationId: string): Promise<PartnerRegistrationDetailDto> {
  return await request<PartnerRegistrationDetailDto>(
    `/api/admitto/registrations/${encodeURIComponent(registrationId)}`
  );
}

export async function updateRegistration(
  registrationId: string,
  firstName: string,
  lastName: string,
  ticketTypeIds: string[] | null,
  additionalDetails: Record<string, string>
) {
  await request(`/api/admitto/registrations/${encodeURIComponent(registrationId)}`, {
    method: "PUT",
    body: JSON.stringify({ firstName, lastName, ticketTypeIds, additionalDetails })
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

  const contentType = res.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await res.json().catch(() => ({}))
    : await res.text().catch(() => "");

  if (!res.ok) {
    const message = typeof data === "string"
      ? data || `${res.status} ${res.statusText}`.trim()
      : data?.message || data?.detail || `${res.status} ${res.statusText}`.trim();

    throw new AdmittoError(
      message || "Admitto request failed.",
      typeof data === "string" ? undefined : data?.code ?? data?.errorCode,
      typeof data === "string" ? undefined : data?.registrationId,
      res.status
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
