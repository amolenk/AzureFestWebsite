"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  changeTickets,
  getTicketTypes
} from "@/src/api/admitto-client";
import { hasCapacity, PublicTicketTypeDto, requiresWaitlist } from "@/src/api/admitto-types";
import ErrorCard from "../common/ErrorCard";
import SpinningButton from "../common/SpinningButton";

interface UpdateRegistrationFormProps {
  registrationId: string;
}

export default function UpdateRegistrationForm({ registrationId }: UpdateRegistrationFormProps) {
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittingError, setSubmittingError] = useState("");
  const [submittingSuccess, setSubmittingSuccess] = useState("");
  const [ticketTypes, setTicketTypes] = useState<PublicTicketTypeDto[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const types = await getTicketTypes();
        setTicketTypes(types);
      } catch (err: any) {
        setLoadingError(err.message || "Could not fetch ticket availability.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const conferenceTicket = useMemo(() => ticketTypes[0] ?? null, [ticketTypes]);

  const canClaimTicket = conferenceTicket !== null && hasCapacity(conferenceTicket) && !requiresWaitlist(conferenceTicket);

  const handleClaimTicket = async () => {
    setSubmitting(true);
    setSubmittingError("");
    setSubmittingSuccess("");

    try {
      await changeTickets(registrationId, [conferenceTicket!.id]);
      setSubmittingSuccess("Registration updated successfully.");
    } catch (err: any) {
      setSubmittingError(err.message || "Registration update failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (loadingError) {
    return <ErrorCard error={loadingError} />;
  }

  return (
    <div className="mx-auto">
      <div className="card h-100 shadow-sm mb-4">
        <div className="card-header text-center">
          <h3>Your Registration</h3>
        </div>
        <div className="card-body text-center">
          <p>You are registered for Azure Fest.</p>

          {canClaimTicket && (
            <>
              <p>If you do not yet have a conference ticket, you can claim one below.</p>
              <SpinningButton type="button" loading={submitting} className="mt-2" onClick={handleClaimTicket}>
                Claim conference ticket
              </SpinningButton>
            </>
          )}

          {conferenceTicket && requiresWaitlist(conferenceTicket) && (
            <p className="text-muted">Tickets are currently fully booked. Join the waitlist via the tickets page.</p>
          )}

          {!conferenceTicket && (
            <p className="text-danger">Tickets are sold out.</p>
          )}

          {submittingError && <div className="text-danger mt-3">{submittingError}</div>}
          {submittingSuccess && <div className="text-success mt-3">{submittingSuccess}</div>}

          <div className="mt-4">
            <Link href={`/tickets/cancel/${registrationId}`} className="btn btn-danger">
              Cancel Registration
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
