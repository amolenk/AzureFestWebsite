export class AdmittoError extends Error {
  code?: string;
  registrationId?: string;
  statusCode?: number;

  constructor(message: string, code?: string, registrationId?: string, statusCode?: number) {
    super(message);
    this.code = code;
    this.registrationId = registrationId;
    this.statusCode = statusCode;
  }
}

export interface VerifyOtpResult {
  token: string;
}

export interface PartnerTicketDetailDto {
  id: string;
  name: string;
}

export interface PartnerRegistrationDetailDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: "registered" | "cancelled" | null;
  ticketTypeIds: string[];
  tickets: PartnerTicketDetailDto[];
  additionalDetails: Record<string, string>;
}

export interface PublicTicketTypeDto {
  id: string;
  name: string;
  timeSlots: string[];
  status: "available" | "soldOut" | "waitlist";
}

export function hasCapacity(ticket: PublicTicketTypeDto): boolean {
  return ticket.status === "available";
}

export function requiresWaitlist(ticket: PublicTicketTypeDto): boolean {
  return ticket.status === "waitlist";
}
