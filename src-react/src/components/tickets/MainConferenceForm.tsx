"use client";

import { hasCapacity, PublicTicketTypeDto, requiresWaitlist } from "@/src/api/admitto-types";
import { websiteSettings } from "@/src/config/website-settings";
import { formatDate } from "@/src/utils/date-utils";

interface MainConferenceFormProps {
  ticketType: PublicTicketTypeDto | null;
}

export default function MainConferenceForm({ ticketType }: MainConferenceFormProps) {
  const edition = websiteSettings.currentEdition;
  const date = formatDate(edition.conferenceDate);

  if (!ticketType) {
    return (
      <div className="card h-100 shadow-sm mt-3 mb-4">
        <div className="card-header text-center">
          <h3>
            Tickets - {date}
            <span className="badge bg-danger ms-2">Sold Out</span>
          </h3>
        </div>
        <div className="card-body text-start mx-5">
          <p>Tickets are currently fully booked.</p>
        </div>
      </div>
    );
  }

  if (requiresWaitlist(ticketType)) {
    return (
      <div className="card h-100 shadow-sm mt-3 mb-4">
        <div className="card-header text-center">
          <h3>
            Tickets - {date}
            <span className="badge bg-warning text-dark ms-2">Waitlist</span>
          </h3>
        </div>
        <div className="card-body text-start mx-5">
          <p>
            Tickets are currently fully booked, but you can join the waitlist.
            If a spot opens up you will be notified by email.
          </p>
          <p>
            Tickets to Azure Fest are <strong>100% free</strong> and include parking &amp; dinner.
            <span className="badge text-bg-warning ms-2">Waitlist open</span>
          </p>
        </div>
      </div>
    );
  }

  if (!hasCapacity(ticketType)) {
    return (
      <div className="card h-100 shadow-sm mt-3 mb-4">
        <div className="card-header text-center">
          <h3>
            Tickets - {date}
            <span className="badge bg-danger ms-2">Sold Out</span>
          </h3>
        </div>
        <div className="card-body text-start mx-5">
          <p>Tickets are currently fully booked.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card h-100 shadow-sm mt-3 mb-4">
      <div className="card-header text-center">
        <h3>Tickets - {date}</h3>
      </div>
      <div className="card-body text-start mx-5">
        <p>
          Tickets to Azure Fest are <strong>100% free</strong> and include parking &amp; dinner.
        </p>
        <p>
          This registration reserves your seat for the full conference day.
          <span className="badge text-bg-success ms-2">Available</span>
        </p>
      </div>
    </div>
  );
}
