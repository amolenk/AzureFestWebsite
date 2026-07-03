"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  getRegistrationDetails,
  resendTicketConfirmation,
  updateRegistration
} from "@/src/api/admitto-client";
import { PartnerRegistrationDetailDto } from "@/src/api/admitto-types";
import ErrorCard from "../common/ErrorCard";
import PersonalDetailsForm, { PersonalDetails } from "./PersonalDetailsForm";
import SpinningButton from "../common/SpinningButton";
import styles from "./UpdateRegistrationForm.module.css";

interface UpdateRegistrationFormProps {
  registrationId: string;
}

export default function UpdateRegistrationForm({ registrationId }: UpdateRegistrationFormProps) {
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [resending, setResending] = useState(false);
  const [registration, setRegistration] = useState<PartnerRegistrationDetailDto | null>(null);
  const [details, setDetails] = useState<PersonalDetails>({
    firstName: "",
    lastName: "",
    employmentStatus: "",
    companyName: ""
  });

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const registrationDetails = await getRegistrationDetails(registrationId);

        setRegistration(registrationDetails);
        setDetails({
          firstName: registrationDetails.firstName ?? "",
          lastName: registrationDetails.lastName ?? "",
          employmentStatus: getEmploymentStatus(registrationDetails.additionalDetails ?? {}),
          companyName: getAdditionalDetail(registrationDetails.additionalDetails ?? {}, "company-name", "CompanyName")
        });
      } catch (err: any) {
        setLoadingError(err.message || "Could not fetch registration details.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [registrationId]);

  const handleUpdateRegistration = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError("");
    setActionSuccess("");

    try {
      await updateRegistration(
        registrationId,
        details.firstName,
        details.lastName,
        registration?.ticketTypeIds ?? [],
        {
          "employment-status": details.employmentStatus,
          "company-name": details.companyName
        }
      );
      setRegistration((current) => current ? {
        ...current,
        firstName: details.firstName,
        lastName: details.lastName,
        additionalDetails: {
          ...(current.additionalDetails ?? {}),
          "employment-status": details.employmentStatus,
          "company-name": details.companyName
        }
      } : current);
      setActionSuccess("Registration updated successfully.");
    } catch (err: any) {
      setActionError(err.message || "Registration update failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendTicketEmail = async () => {
    setResending(true);
    setActionError("");
    setActionSuccess("");

    try {
      await resendTicketConfirmation(registrationId);
      setActionSuccess("Ticket email requested.");
    } catch (err: any) {
      setActionError(err.message || "Could not resend the ticket email.");
    } finally {
      setResending(false);
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

  if (!registration) {
    return <ErrorCard error="Could not load registration details." />;
  }

  return (
    <div className="mx-auto">
      <form ref={formRef} onSubmit={handleUpdateRegistration} className="ticket-form">
        <div className="card h-100 shadow-sm mb-4">
          <div className="card-header text-center">
            <h3>Your Registration</h3>
          </div>
          <div className="card-body text-center">
            <p>
              You are registered for Azure Fest as <strong>{registration.email}</strong>.
            </p>
            <p className="text-success">Your conference ticket is confirmed.</p>
          </div>
        </div>

        <PersonalDetailsForm details={details} setDetails={setDetails} disabled={submitting}>
          <div className="text-center mt-3">
            {actionError && <div className="text-danger mt-2">{actionError}</div>}
            {actionSuccess && <div className="text-success mt-2">{actionSuccess}</div>}

            <div className={`d-flex flex-column flex-sm-row justify-content-center align-items-center gap-2 mt-2 ${styles.actions}`}>
              <SpinningButton loading={submitting} disabled={!(formRef.current?.checkValidity() ?? false)} className={styles.primaryButton}>
                Save changes
              </SpinningButton>

              <SpinningButton type="button" loading={resending} className={styles.primaryButton} onClick={handleResendTicketEmail}>
                Resend ticket email
              </SpinningButton>

              <Link href={`/tickets/cancel/${registrationId}`} className={`btn btn-danger ${styles.dangerButton}`}>
                Cancel Registration
              </Link>
            </div>

          </div>
        </PersonalDetailsForm>
      </form>
    </div>
  );
}

function getEmploymentStatus(additionalDetails: Record<string, string>): PersonalDetails["employmentStatus"] {
  const value = getAdditionalDetail(additionalDetails, "employment-status", "EmploymentStatus");
  return value === "Employed" || value === "SelfEmployed" ? value : "";
}

function getAdditionalDetail(additionalDetails: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const value = additionalDetails[key];
    if (value) {
      return value;
    }
  }

  return "";
}
