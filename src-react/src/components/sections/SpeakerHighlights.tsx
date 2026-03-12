import Section from "../layout/Section";
import SpeakerCard from "./SpeakerCard";
import { Speaker } from "@/src/lib/conference-data";

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function SpeakerHighlights({ speakers }: { speakers: Speaker[] }) {
  const highlighted = shuffle(speakers);

  return (
    <Section id="speakers" headerText="Speakers" fadeUp={true}>
      <div className="row justify-content-center g-3">
        {highlighted.slice(0, 3).map((speaker) => (
          <div key={speaker.Id} className="col-6 col-md-4 d-flex justify-content-center">
            <SpeakerCard speaker={speaker} />
          </div>
        ))}
      </div>

      <div className="row">
        <div className="col d-flex justify-content-center">
          <a href="/speakers" className="btn btn-primary">
            View all {speakers.length} speakers
          </a>
        </div>
      </div>
    </Section>
  );
}
