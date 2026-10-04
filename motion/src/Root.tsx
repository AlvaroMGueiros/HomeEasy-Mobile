import { Composition } from "remotion";
import { HomeEasyCampaign } from "./HomeEasyCampaign";
import { fps, totalFrames } from "./theme/timings";

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="HomeEasyCampaign16x9"
        component={HomeEasyCampaign}
        durationInFrames={totalFrames}
        fps={fps}
        width={1920}
        height={1080}
      />
      <Composition
        id="HomeEasyCampaign9x16"
        component={HomeEasyCampaign}
        durationInFrames={totalFrames}
        fps={fps}
        width={1080}
        height={1920}
      />
    </>
  );
}
