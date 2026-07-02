import "server-only";

import { websiteSettings } from "./website-settings";

export const registrationVipQueryParam = "vip";

export function hasRegistrationAccess(vipCode?: string | null): boolean {
  return websiteSettings.currentEdition.registration.isOpen() || isValidRegistrationVipCode(vipCode);
}

export function isValidRegistrationVipCode(vipCode?: string | null): boolean {
  const expectedCode = process.env.REGISTRATION_VIP_CODE?.trim();
  const actualCode = vipCode?.trim();

  return !!expectedCode && !!actualCode && actualCode === expectedCode;
}

export function getRegistrationVipCodeFromRequest(req: Request): string | null {
  return new URL(req.url).searchParams.get(registrationVipQueryParam);
}
