import React from "react";
import { Composition } from "remotion";
import { Segment1Intro } from "./Segment1_Intro";
import { Segment2Games } from "./Segment2_Games";
import { Segment3Dashboard } from "./Segment3_Dashboard";
import { Segment4Notification } from "./Segment4_Notification";
import { Segment5Monitoring } from "./Segment5_Monitoring";
import { Segment6Metrics } from "./Segment6_Metrics";
import { Segment8DeploymentImpact } from "./Segment8_DeploymentImpact";
import { Segment10Manifesto } from "./Segment10_Manifesto";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Segment1-Intro"
        component={Segment1Intro}
        durationInFrames={270}
        fps={30}
        width={1280}
        height={714}
      />
      <Composition
        id="Segment2-Games"
        component={Segment2Games}
        durationInFrames={390}
        fps={30}
        width={1280}
        height={714}
      />
      <Composition
        id="Segment3-Dashboard"
        component={Segment3Dashboard}
        durationInFrames={360}
        fps={30}
        width={1280}
        height={714}
      />
      <Composition
        id="Segment4-Notification"
        component={Segment4Notification}
        durationInFrames={210}
        fps={30}
        width={1280}
        height={714}
      />
      <Composition
        id="Segment5-Monitoring"
        component={Segment5Monitoring}
        durationInFrames={330}
        fps={30}
        width={1280}
        height={714}
      />
      <Composition
        id="Segment6-Metrics"
        component={Segment6Metrics}
        durationInFrames={240}
        fps={30}
        width={1280}
        height={714}
      />
      <Composition
        id="Segment8-DeploymentImpact"
        component={Segment8DeploymentImpact}
        durationInFrames={240}
        fps={30}
        width={1280}
        height={714}
      />
      <Composition
        id="Segment10-Manifesto"
        component={Segment10Manifesto}
        durationInFrames={645}
        fps={30}
        width={1280}
        height={714}
      />
    </>
  );
};
