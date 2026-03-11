import { readFile } from "fs/promises";
import path from "path";
import MainLayout from "@/src/components/layout/MainLayout";
import Section from "@/src/components/layout/Section";
import SessionDetailSection from "@/src/components/sections/SessionDetailSection";
import { websiteSettings } from "@/src/config/website-settings";

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
    const filePath = path.join(process.cwd(), "public", "data", `${edition}.json`);
    const fileContent = await readFile(filePath, "utf-8");
    const data = JSON.parse(fileContent);
    let session = (data.Sessions || []).find((s: any) => s.Id === sessionId);

    if (!session) {
      return (
        <MainLayout>
          <Section headerText="Session">
            <p>Session not found.</p>
          </Section>
        </MainLayout>
      );
    }

    session = {
      ...session,
      Speakers: (session.speakers || [])
        .map((speakerId: string) => (data.Speakers || []).find((speaker: any) => speaker.Id === speakerId))
        .filter(Boolean)
    };

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
