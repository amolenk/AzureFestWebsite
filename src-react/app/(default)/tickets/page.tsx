import MainLayout from "@/src/components/layout/MainLayout";
import Section from "@/src/components/layout/Section";
import EmailForm from "@/src/components/tickets/EmailForm";
import ErrorCard from "@/src/components/common/ErrorCard";
import { getTicketTypes } from "@/src/api/admitto";
import { hasCapacity, requiresWaitlist } from "@/src/api/admitto-types";
import { hasRegistrationAccess } from "@/src/config/registration-access";
import { websiteSettings } from "@/src/config/website-settings";

export const metadata = {
  title: "Tickets | Azure Fest"
};

export const dynamic = "force-dynamic";

export default async function TicketsPage({
  searchParams
}: {
  searchParams: Promise<{ vip?: string }>;
}) {
  const { vip: vipCode } = await searchParams;
  const edition = websiteSettings.currentEdition;
  const registrationVisible = hasRegistrationAccess(vipCode);

  if (!registrationVisible) {
    return (
      <MainLayout>
        <Section id="tickets" headerText="Tickets">
          <div className="row justify-content-center">
            <div className="col-lg-6 text-center">
              <p>Tickets to Azure Fest are 100% free and include parking &amp; dinner.</p>
              <p>
                We're currently hard at work preparing for Azure Fest. Tickets will be available soon.
              </p>
            </div>
          </div>
        </Section>
      </MainLayout>
    );
  }

  try {
    const ticketTypes = await getTicketTypes();
    const allSoldOut = ticketTypes.length > 0 && ticketTypes.every(
      (t) => !hasCapacity(t) && !requiresWaitlist(t)
    );

    if (allSoldOut) {
      return (
        <MainLayout>
          <Section id="tickets" headerText="Tickets">
            <div className="row justify-content-center">
              <div className="col-lg-6 text-center">
                <p>We&apos;re sorry, but all tickets for Azure Fest are currently sold out.</p>
                <p>Please follow us on social media for updates and future editions.</p>
              </div>
            </div>
          </Section>
        </MainLayout>
      );
    }
  } catch {
    return (
      <MainLayout>
        <ErrorCard error="An error occurred while checking ticket availability." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Section id="tickets" headerText="Tickets">
        <div className="row">
          <div className="col-lg-3"></div>
          <div className="col-lg-6">
            <div className="card mb-5 mb-lg-0">
              <div className="card-body">
                <h5 className="card-title text-muted text-uppercase text-center">Tickets</h5>
                <h6 className="card-price text-center">FREE</h6>
                <hr />
                <div className="text-center">
                  <p>Tickets to Azure Fest are 100% free and include parking &amp; dinner.</p>
                </div>
                <hr />
                <EmailForm vipCode={vipCode} />
              </div>
            </div>
          </div>
          <div className="col-lg-3"></div>
        </div>
      </Section>
    </MainLayout>
  );
}
