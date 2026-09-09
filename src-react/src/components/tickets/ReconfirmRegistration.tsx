"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { reconfirmRegistration } from "@/src/api/admitto-client";

type ReconfirmState = "pending" | "success" | "error";

interface ReconfirmRegistrationProps {
  registrationId?: string;
}

function errorMessage(error: unknown) {
  return error instanceof Error && error.message
    ? error.message
    : "We couldn’t reconfirm your registration. Please try again.";
}

export default function ReconfirmRegistration({ registrationId }: ReconfirmRegistrationProps) {
  const [state, setState] = useState<ReconfirmState>("pending");
  const [error, setError] = useState("");
  const hasStarted = useRef(false);

  const reconfirm = useCallback(async () => {
    if (!registrationId) {
      setState("error");
      setError("We couldn’t find a registration to reconfirm. Please use the link from your email again.");
      return;
    }

    setState("pending");
    setError("");

    try {
      await reconfirmRegistration(registrationId);
      setState("success");
    } catch (err: unknown) {
      setState("error");
      setError(errorMessage(err));
    }
  }, [registrationId]);

  useEffect(() => {
    if (hasStarted.current) {
      return;
    }

    hasStarted.current = true;
    void reconfirm();
  }, [reconfirm]);

  if (state === "pending") {
    return (
      <div className="card border-0 shadow-sm text-center" role="status" aria-live="polite">
        <div className="card-body p-4 p-md-5">
          <div className="spinner-border text-primary mb-4" aria-hidden="true" />
          <h3 className="h4">Reconfirming your registration</h3>
          <p className="mb-0 text-muted">Just a moment while we refresh your place at Azure Fest.</p>
        </div>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="card border-0 shadow-sm text-center">
        <div className="card-body p-4 p-md-5">
          <div className="display-5 text-success mb-3" aria-hidden="true">✓</div>
          <h3 className="h4">You’re all set!</h3>
          <p className="lead mt-3 mb-3">Your Azure Fest registration has been reconfirmed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-danger shadow-sm text-center" role="alert" aria-live="assertive">
      <div className="card-body p-4 p-md-5">
        <h3 className="h4">We couldn’t reconfirm your registration</h3>
        <p className="text-muted mt-3 mb-4">{error}</p>
        {registrationId ? (
          <button type="button" className="btn btn-primary" onClick={() => void reconfirm()}>
            Try again
          </button>
        ) : (
          <a href="/tickets" className="btn btn-primary">Return to tickets</a>
        )}
      </div>
    </div>
  );
}
