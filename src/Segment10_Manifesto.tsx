import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Sequence,
  OffthreadVideo,
  staticFile,
} from "remotion";
import { fontFamily } from "./fonts";

// Deterministic pseudo-random
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const PHRASES = [
  "673 patients per clinician. No one is watching at home. There is a",
  "Stroke recovery happens in 12 weeks. Clinicians see 2 of them. There is a",
  "The data exists. The camera exists. The patient exists. There is a",
];

const PHRASE_DURATION = 90; // 3s each at 30fps
const TOTAL_MANIFESTO = PHRASES.length * PHRASE_DURATION; // 9s

// Small sparkles around the GAP word
const GapSparkles: React.FC = () => {
  const frame = useCurrentFrame();

  const sparkles = Array.from({ length: 6 }, (_, i) => {
    const angle = seededRandom(i * 17) * Math.PI * 2;
    const dist = 8 + seededRandom(i * 23) * 14;
    const x = Math.cos(angle + frame * 0.03 * (i % 2 === 0 ? 1 : -1)) * dist;
    const y = Math.sin(angle + frame * 0.04) * dist;
    const cycle = ((frame * 0.06 + i * 1.8) % 2) / 2;
    const opacity = cycle < 0.5 ? cycle * 2 : (1 - cycle) * 2;
    const size = 2 + seededRandom(i * 7) * 2;

    return { x, y, opacity: opacity * 0.7, size };
  });

  return (
    <>
      {sparkles.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `calc(50% + ${s.x}px)`,
            top: `calc(50% + ${s.y}px)`,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            backgroundColor: "#e63946",
            opacity: s.opacity,
            boxShadow: "0 0 4px #e63946",
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </>
  );
};

const ManifestoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Which phrase is currently active
  const activeIndex = Math.min(
    Math.floor(frame / PHRASE_DURATION),
    PHRASES.length - 1
  );

  const centerY = 357;
  const lineHeight = 55;

  // GAP is anchored at a fixed position — phrases align to its left
  // Moved GAP further right to give room for the longest phrase
  const gapLeft = 1010; // left edge of GAP word

  // GAP pulse
  const gapPulse = Math.sin(frame * 0.1) * 0.06 + 1;

  // GAP fade in at the very start
  const gapFadeIn = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Static GAP — absolutely positioned, never moves */}
      <div
        style={{
          position: "absolute",
          left: gapLeft,
          top: centerY,
          transform: `translateY(-50%) scale(${gapPulse})`,
          transformOrigin: "left center",
          opacity: gapFadeIn,
          zIndex: 10,
        }}
      >
        <span
          style={{
            position: "relative",
            display: "inline-block",
            fontFamily,
            fontSize: 32,
            fontWeight: 800,
            fontStyle: "italic",
            color: "#e63946",
            letterSpacing: "2px",
            textShadow: "0 0 8px #e6394688, 0 0 20px #e6394644",
          }}
        >
          GAP
        </span>
        <GapSparkles />
      </div>

      {/* Phrases — right-aligned to end just before GAP */}
      {PHRASES.map((phrase, i) => {
        const phraseStart = i * PHRASE_DURATION;
        const localFrame = frame - phraseStart;

        if (localFrame < 0) return null;

        const isActive = i === activeIndex;
        const isPast = i < activeIndex;

        // Fade in
        const fadeIn = interpolate(localFrame, [0, 14], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        // Slide in from below
        const slideIn = interpolate(localFrame, [0, 14], [20, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        // When past: fade to dim and slide up
        const dimProgress = isPast
          ? interpolate(
              frame - (i + 1) * PHRASE_DURATION,
              [0, 12],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            )
          : 0;

        const brightness = isPast ? interpolate(dimProgress, [0, 1], [1, 0.3]) : 1;
        const yOffset = isPast ? -dimProgress * lineHeight * (activeIndex - i) : slideIn;

        const textColor = `rgba(255, 255, 255, ${brightness * fadeIn})`;
        const glowAmount = isActive ? 0.5 : 0;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              // right edge of phrase text stops 14px before GAP
              width: gapLeft - 14,
              top: centerY,
              transform: `translateY(calc(-50% + ${yOffset}px))`,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "baseline",
              opacity: fadeIn,
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                fontFamily,
                fontSize: 28,
                fontWeight: 500,
                fontStyle: "italic",
                color: textColor,
                letterSpacing: "-0.3px",
                textShadow: isActive
                  ? `0 0 10px rgba(255,255,255,${glowAmount}), 0 0 25px rgba(255,255,255,${glowAmount * 0.3})`
                  : "none",
              }}
            >
              {phrase}
            </span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Transition to ending
const ManifestoToEndingTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lineX = interpolate(frame, [0, fps * 0.4], [-5, 105], {
    extrapolateRight: "clamp",
  });

  const lineOpacity = interpolate(
    frame,
    [0, fps * 0.08, fps * 0.35, fps * 0.5],
    [0, 0.8, 0.8, 0],
    { extrapolateRight: "clamp" }
  );

  const blackOpacity = interpolate(frame, [fps * 0.2, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#000",
          opacity: blackOpacity,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${lineX}%`,
          width: 3,
          background:
            "linear-gradient(180deg, transparent 10%, #22d3ee 50%, transparent 90%)",
          boxShadow: "0 0 20px #22d3ee, 0 0 40px #22d3ee44",
          opacity: lineOpacity,
        }}
      />
    </AbsoluteFill>
  );
};

// Ending video
const EndingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", opacity: fadeIn }}>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <OffthreadVideo
          src={staticFile("Ending.mp4")}
          style={{
            width: 1280,
            height: 714,
            objectFit: "contain",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Segment10Manifesto: React.FC = () => {
  const { fps } = useVideoConfig();

  const transitionStart = TOTAL_MANIFESTO - Math.round(fps * 0.5);
  const endingStart = TOTAL_MANIFESTO;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Manifesto — GAP stays fixed, phrases rotate */}
      <Sequence from={0} durationInFrames={TOTAL_MANIFESTO}>
        <ManifestoScene />
      </Sequence>

      {/* Transition */}
      <Sequence from={transitionStart} durationInFrames={Math.round(fps * 1)}>
        <ManifestoToEndingTransition />
      </Sequence>

      {/* Ending video */}
      <Sequence from={endingStart} durationInFrames={Math.round(fps * 12.5)}>
        <EndingScene />
      </Sequence>
    </AbsoluteFill>
  );
};
