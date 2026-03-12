import { readFile } from "fs/promises";
import path from "path";
import { cache } from "react";

export interface Speaker {
  Id: string;
  FullName: string;
  TagLine?: string;
  Bio?: string;
  ProfilePictureUrl: string;
  sessions?: string[];
}

export interface Session {
  Id: string;
  Title: string;
  Description?: string;
  Room?: string;
  StartsAt?: string;
  EndsAt?: string;
  IsServiceSession?: boolean;
  speakers?: string[];
}

export interface SessionWithSpeakers extends Session {
  Speakers: Speaker[];
}

interface ConferenceData {
  Speakers: Speaker[];
  Sessions: Session[];
}

const getConferenceData = cache(async (edition: string): Promise<ConferenceData> => {
  const filePath = path.join(process.cwd(), "public", "data", `${edition}.json`);
  const fileContent = await readFile(filePath, "utf-8");
  const data = JSON.parse(fileContent) as ConferenceData;
  return {
    Speakers: data.Speakers || [],
    Sessions: data.Sessions || []
  };
});

export async function getSpeakers(edition: string): Promise<Speaker[]> {
  const data = await getConferenceData(edition);
  return data.Speakers;
}

export async function getSpeaker(edition: string, speakerId: string): Promise<Speaker | null> {
  const data = await getConferenceData(edition);
  return data.Speakers.find((s) => s.Id === speakerId) ?? null;
}

export async function getSessionsWithSpeakers(edition: string): Promise<SessionWithSpeakers[]> {
  const data = await getConferenceData(edition);
  return data.Sessions.map((session) => ({
    ...session,
    Speakers: (session.speakers || [])
      .map((speakerId) => data.Speakers.find((s) => s.Id === speakerId))
      .filter((s): s is Speaker => s !== undefined)
  }));
}

export async function getSessionWithSpeakers(
  edition: string,
  sessionId: string
): Promise<SessionWithSpeakers | null> {
  const data = await getConferenceData(edition);
  const session = data.Sessions.find((s) => s.Id === sessionId);
  if (!session) return null;
  return {
    ...session,
    Speakers: (session.speakers || [])
      .map((speakerId) => data.Speakers.find((s) => s.Id === speakerId))
      .filter((s): s is Speaker => s !== undefined)
  };
}
