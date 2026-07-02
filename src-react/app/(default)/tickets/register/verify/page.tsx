import { Suspense } from "react";
import MainLayout from "@/src/components/layout/MainLayout";
import Section from "@/src/components/layout/Section";
import OtpVerifyForm from "@/src/components/tickets/OtpVerifyForm";
import { hasRegistrationAccess } from "@/src/config/registration-access";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Ticket Registration | Azure Fest"
};

export default async function VerifyPage({
  searchParams
}: {
  searchParams: Promise<{ email?: string; vip?: string }>;
}) {
  const { email, vip: vipCode } = await searchParams;

  if (!hasRegistrationAccess(vipCode)) {
    redirect("/tickets");
  }

  if (!email) {
    const params = new URLSearchParams();
    if (vipCode) {
      params.set("vip", vipCode);
    }
    redirect(`/tickets${params.size > 0 ? `?${params.toString()}` : ""}`);
  }

  return (
    <MainLayout>
      <Section headerText="Verify Email" sectionBackground={1}>
        <div className="row justify-content-center mb-5">
          <div className="col-lg-6">
            <div className="card h-100 shadow-sm">
              <div className="card-header text-center">
                <h3>We&apos;ve sent a verification code to your email. Enter it below to continue.</h3>
              </div>
              <div className="card-body center text-center">
                <p className="text-center text-muted">(If you don&apos;t receive an email shortly, please check your spam folder.)</p>
                <Suspense fallback={<div>Loading verification form...</div>}>
                  <OtpVerifyForm email={email} vipCode={vipCode} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </MainLayout>
  );
}
