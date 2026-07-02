import MainLayout from "@/src/components/layout/MainLayout";
import Section from "@/src/components/layout/Section";
import EmailForm from "@/src/components/tickets/EmailForm";
import RegisterForm from "@/src/components/tickets/RegisterForm";
import { hasRegistrationAccess } from "@/src/config/registration-access";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Ticket Registration | Azure Fest"
};

export default async function RegisterPage({
  searchParams
}: {
  searchParams: Promise<{ email?: string; token?: string; registrationId?: string; vip?: string }>;
}) {
  const { email, token, registrationId, vip: vipCode } = await searchParams;

  if (!hasRegistrationAccess(vipCode)) {
    redirect("/tickets");
  }

  if (!email || !token) {
    if (!vipCode) {
      redirect("/tickets");
    }

    return (
      <MainLayout>
        <Section headerText="Registration" sectionBackground={1}>
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

  return (
    <MainLayout>
      <Section headerText="Registration" sectionBackground={1}>
        <div className="row justify-content-center mb-5">
          <div className="col-lg-9">
            <RegisterForm email={email} token={token} registrationId={registrationId} vipCode={vipCode} />
          </div>
        </div>
      </Section>
    </MainLayout>
  );
}
