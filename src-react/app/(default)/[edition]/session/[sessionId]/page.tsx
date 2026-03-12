import MainLayout from "@/src/components/layout/MainLayout";
import Section from "@/src/components/layout/Section";
import SessionDetailSection from "@/src/components/sections/SessionDetailSection";
import { websiteSettings } from "@/src/config/website-settings";
import { getSessionWithSpeakers } from "@/src/lib/conference-data";

export const metadata = {
  title: "Session Details | Azure Fest"
};

export default async function SessionDetailPage({
  params
}: {
  params: Promise<{ edition: string; sessionId: string }>;
}) {
  let { edition, sessionId } = await params;
  edition = edition ?? websiteSettings.currentEdition.slug;

  try {
    const session = await getSessionWithSpeakers(edition, sessionId);

    if (!session) {
      return (
        <MainLayout>
          <Section headerText="Session">
            <p>Session not found.</p>
          </Section>
        </MainLayout>
      );
    }

    return (
      <MainLayout>
        <Section headerText={session.Title}>
          <SessionDetailSection session={session} edition={edition} />
        </Section>
      </MainLayout>
    );
  } catch {
    return (
      <MainLayout>
        <Section headerText="Session">
          <p>Failed to load session.</p>
        </Section>
      </MainLayout>
    );
  }
}
