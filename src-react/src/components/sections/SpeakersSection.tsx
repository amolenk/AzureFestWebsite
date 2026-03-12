import { websiteSettings } from "@/src/config/website-settings";
import Section from "../layout/Section";
import SpeakerCard from "./SpeakerCard";
import { Speaker } from "@/src/lib/conference-data";

export default function SpeakersSection({ speakers }: { speakers: Speaker[] }) {
  const cfp = websiteSettings.currentEdition.cfp;

  return (
    <Section headerText="Speakers">
      {cfp.isOpen() && (
        <div className="text-center mb-4">
          <p>
            Interested in speaking? Submit your session via{" "}
            <a href={cfp.sessionizeUrl} target="_blank" rel="noopener noreferrer">
              Sessionize
            </a>
            .
          </p>
        </div>
      )}
      <div className="row justify-content-center g-3">
        {speakers.map((speaker) => (
          <div key={speaker.Id} className="col-6 col-md-4 d-flex justify-content-center">
            <SpeakerCard speaker={speaker} />
          </div>
        ))}
      </div>
    </Section>
  );
}
