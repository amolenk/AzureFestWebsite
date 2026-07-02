import MainLayout from "@/src/components/layout/MainLayout";
import Section from "@/src/components/layout/Section";

export const metadata = {
  title: "Ticket Registration | Azure Fest"
};

interface ThankYouPageProps {
  searchParams: Promise<{ waitlist?: string }>;
}

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const { waitlist } = await searchParams;
  const joinedWaitlist = waitlist === "1";

  return (
    <MainLayout>
      <Section headerText={joinedWaitlist ? "Waitlist Joined" : "Registration Complete"} sectionBackground={1}>
        <div className="text-center">
          <h2>{joinedWaitlist ? "You're on the waitlist!" : "Thank you for registering!"}</h2>
          <p className="lead mt-5">
            {joinedWaitlist
              ? "We've added you to the waitlist. Check your email for confirmation."
              : "We've received your registration. Check your email for confirmation."}
          </p>
          <p className="mt-5">If you don&apos;t receive an email shortly, please check your spam folder.</p>
        </div>
      </Section>
    </MainLayout>
  );
}
