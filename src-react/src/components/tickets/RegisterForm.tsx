"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ErrorCard from "../common/ErrorCard";
import MainConferenceForm from "./MainConferenceForm";
import PersonalDetailsForm, { PersonalDetails } from "./PersonalDetailsForm";
import SpinningButton from "../common/SpinningButton";
import {
  AdmittoError,
  getTicketTypes,
  joinWaitlist,
  register,
  resolveRegistrationIdByEmail
} from "../../api/admitto-client";
import { hasCapacity, PublicTicketTypeDto, requiresWaitlist } from "../../api/admitto-types";

interface RegisterFormProps {
  email: string;
  token: string;
  registrationId?: string;
  vipCode?: string;
}

export default function RegisterForm({ email, token, registrationId, vipCode }: RegisterFormProps) {
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittingError, setSubmittingError] = useState("");
  const [ticketTypes, setTicketTypes] = useState<PublicTicketTypeDto[]>([]);
  const [details, setDetails] = useState<PersonalDetails>({
    firstName: "",
    lastName: "",
    employmentStatus: "",
    companyName: ""
  });

  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      if (registrationId) {
        router.push(`/tickets/edit/${registrationId}`);
        setLoading(false);
        return;
      }

      try {
        const resolvedRegistrationId = await resolveRegistrationIdByEmail(email, token, vipCode);
        if (resolvedRegistrationId) {
          router.push(`/tickets/edit/${resolvedRegistrationId}`);
          setLoading(false);
          return;
        }

        const types = await getTicketTypes(vipCode);
        setTicketTypes(types);
        setLoading(false);
      } catch (err: any) {
        if (err instanceof AdmittoError && err.code === "email.verification_invalid") {
          router.push("/tickets/register/expired");
          return;
        }

        setLoadingError(err.message || "Could not fetch ticket availability.");
        setLoading(false);
      }
    }

    fetchData();
  }, [email, registrationId, router, token, vipCode]);

  useEffect(() => {
    if (email === "" || token === "") {
      router.push("/tickets/register/expired");
    }
  }, [email, token, router]);

  const conferenceTicket = useMemo(() => ticketTypes[0] ?? null, [ticketTypes]);

  const isWaitlistMode = conferenceTicket ? requiresWaitlist(conferenceTicket) : false;
  const canProceed = conferenceTicket !== null && (hasCapacity(conferenceTicket) || isWaitlistMode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmittingError("");

    if (!conferenceTicket) {
      setSubmitting(false);
      return;
    }

    const ticketTypeId = conferenceTicket.id;

    try {
      if (isWaitlistMode) {
        await joinWaitlist(ticketTypeId, email, token, vipCode);
        router.push("/tickets/register/thankyou?waitlist=1");
        return;
      }

      await register(
        email,
        details.firstName,
        details.lastName,
        {
          "employment-status": details.employmentStatus,
          "company-name": details.companyName
        },
        isWaitlistMode ? [] : [ticketTypeId],
        isWaitlistMode ? [ticketTypeId] : [],
        token,
        vipCode
      );

      router.push("/tickets/register/thankyou");
    } catch (err: any) {
      if (err instanceof AdmittoError && err.code === "attendee.invalid_token") {
        router.push("/tickets/register/expired");
      } else if (err instanceof AdmittoError && err.registrationId) {
        setSubmitting(false);
        router.push(`/tickets/edit/${err.registrationId}`);
      } else if (err instanceof AdmittoError && err.code === "attendee.already_registered") {
        const resolvedRegistrationId = await resolveRegistrationIdByEmail(email, token, vipCode);
        setSubmitting(false);

        if (resolvedRegistrationId) {
          router.push(`/tickets/edit/${resolvedRegistrationId}`);
        } else {
          setSubmittingError("You are already registered. Please use the link in your ticket email to manage your registration.");
        }
      } else {
        setSubmitting(false);
        setSubmittingError(err.message || `${isWaitlistMode ? "Joining the waitlist" : "Registration"} failed. Please try again.`);
      }
    }
  };

  const isFormValid = () => (
    isWaitlistMode ? canProceed : (formRef.current?.checkValidity() ?? false) && canProceed
  );

  if (loading || email === "" || token === "") {
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
      <form ref={formRef} onSubmit={handleSubmit} className="ticket-form">
        <MainConferenceForm ticketType={conferenceTicket} />

        {isWaitlistMode && canProceed && (
          <div className="text-center mt-3">
            {submittingError && <div className="text-danger mt-2">{submittingError}</div>}

            <SpinningButton loading={submitting} disabled={!isFormValid()} className="mt-2">
              Join Waitlist
            </SpinningButton>
          </div>
        )}

        {!isWaitlistMode && canProceed && (
          <PersonalDetailsForm details={details} setDetails={setDetails} disabled={submitting}>
            <div className="text-center mt-3">
              {submittingError && <div className="text-danger mt-2">{submittingError}</div>}

              <div className="text-center">
                <SpinningButton loading={submitting} disabled={!isFormValid()} className="mt-2">
                  Register
                </SpinningButton>
              </div>
            </div>
          </PersonalDetailsForm>
        )}
      </form>
    </div>
  );
}
