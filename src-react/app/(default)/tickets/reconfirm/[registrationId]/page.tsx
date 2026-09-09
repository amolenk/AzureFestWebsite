import MainLayout from "@/src/components/layout/MainLayout";
import Section from "@/src/components/layout/Section";
import ReconfirmRegistration from "@/src/components/tickets/ReconfirmRegistration";

export const metadata = {
  title: "Registration Reconfirmed | Azure Fest"
};

interface ReconfirmPageProps {
  params: Promise<{ registrationId: string }>;
}

export default async function ReconfirmPage({ params }: ReconfirmPageProps) {
  const { registrationId } = await params;

  return (
    <MainLayout>
      <Section headerText="Registration Reconfirmed" sectionBackground={1}>
        <div className="row justify-content-center mb-5">
          <div className="col-lg-7 col-xl-6">
            <ReconfirmRegistration registrationId={registrationId} />
          </div>
        </div>
      </Section>
    </MainLayout>
  );
}
