"use client";

import Link from "next/link";
import { useState } from "react";
import { resendTicketConfirmation } from "@/src/api/admitto-client";
import SpinningButton from "../common/SpinningButton";

interface ExistingRegistrationOptionsProps {
  email: string;
  registrationId: string;
}

export default function ExistingRegistrationOptions({ email, registrationId }: ExistingRegistrationOptionsProps) {
  const [resending, setResending] = useState(false);
  const [resendError, setResendError] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResend = async () => {
    setResending(true);
    setResendError("");
    setResendSuccess(false);

    try {
      await resendTicketConfirmation(registrationId);
      setResendSuccess(true);
    } catch (err: any) {
      setResendError(err.message || "Could not resend the ticket confirmation email.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="card h-100 shadow-sm mt-3 mb-4">
      <div className="card-header text-center">
        <h3>You are already registered</h3>
      </div>
      <div className="card-body text-center">
        <p>
          We found an existing registration for <strong>{email}</strong>.
        </p>
        <p>What would you like us to do?</p>

        <div className="d-flex flex-column flex-sm-row justify-content-center gap-2 mt-4">
          <SpinningButton type="button" loading={resending} className="btn-primary" onClick={handleResend}>
            Resend ticket confirmation email
          </SpinningButton>
          <Link href={`/tickets/cancel/${registrationId}`} className="btn btn-danger text-light">
            Cancel registration
          </Link>
        </div>

        {resendSuccess && <div className="text-success mt-3">Ticket confirmation email requested.</div>}
        {resendError && <div className="text-danger mt-3">{resendError}</div>}
      </div>
    </div>
  );
}
