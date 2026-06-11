import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Sequence,
} from "remotion";
import { fontFamily } from "./fonts";

const IridescentBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const slowDrift = frame * 0.3;

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(
            ellipse at ${50 + Math.sin(slowDrift * 0.01) * 10}% ${50 + Math.cos(slowDrift * 0.012) * 8}%,
            #1a3a5c 0%,
            #0d1f3c 35%,
            #060e1a 70%,
            #020810 100%
          )
        `,
      }}
    />
  );
};

const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  const particles = Array.from({ length: 40 }, (_, i) => {
    const x = (i * 37 + frame * 0.1 * (i % 3 + 1)) % 100;
    const y = (i * 53 + frame * 0.05 * (i % 4 + 1)) % 100;
    const opacity = 0.15 + Math.sin(frame * 0.02 + i) * 0.1;
    const size = 1 + (i % 3);
    return { x, y, opacity, size };
  });

  return (
    <AbsoluteFill>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            backgroundColor: "white",
            opacity: p.opacity,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

const GlowLine: React.FC<{ progress: number }> = ({ progress }) => {
  const width = interpolate(progress, [0, 1], [0, 100]);
  const opacity = interpolate(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: `${width}%`,
        height: 2,
        opacity,
        background:
          "linear-gradient(90deg, transparent, #4a9eff, #00d4ff, #4a9eff, transparent)",
        boxShadow: "0 0 20px #00d4ff, 0 0 40px #4a9eff33",
      }}
    />
  );
};

const AnimatedText: React.FC<{
  text: string;
  highlight?: string;
  delay: number;
  fontSize?: number;
  subtitle?: string;
}> = ({ text, highlight, delay, fontSize = 72, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - delay;
  if (localFrame < 0) return null;

  const textOpacity = interpolate(localFrame, [0, fps * 0.4], [0, 1], {
    extrapolateRight: "clamp",
  });

  const textY = interpolate(localFrame, [0, fps * 0.4], [20, 0], {
    extrapolateRight: "clamp",
  });

  const subtitleOpacity = interpolate(
    localFrame,
    [fps * 0.5, fps * 0.9],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const parts = highlight ? text.split(highlight) : [text];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        opacity: textOpacity,
        transform: `translateY(${textY}px)`,
      }}
    >
      <h1
        style={{
          fontFamily,
          fontSize,
          fontWeight: 300,
          color: "white",
          margin: 0,
          letterSpacing: "-1px",
        }}
      >
        {highlight ? (
          <>
            {parts[0]}
            <span
              style={{
                fontWeight: 600,
                background: "linear-gradient(135deg, #60a5fa, #38bdf8, #22d3ee)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {highlight}
            </span>
            {parts[1]}
          </>
        ) : (
          text
        )}
      </h1>
      {subtitle && (
        <p
          style={{
            fontFamily,
            fontSize: 24,
            fontWeight: 300,
            color: "#94a3b8",
            margin: 0,
            letterSpacing: "2px",
            textTransform: "uppercase",
            opacity: subtitleOpacity,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export const Segment1Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const lineProgress = interpolate(frame, [0, fps * 0.8], [0, 1], {
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(
    frame,
    [durationInFrames - fps * 0.5, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <IridescentBackground />
      <Particles />

      {/* Scene 1: Meet Maria */}
      <Sequence from={0} durationInFrames={fps * 3}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <GlowLine progress={lineProgress} />
          <AnimatedText
            text="This is Maria."
            highlight="Maria"
            delay={Math.round(fps * 0.3)}
            fontSize={78}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: 71 years old */}
      <Sequence from={fps * 3} durationInFrames={fps * 2.5}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <AnimatedText
            text="71 years old. Stroke survivor."
            highlight="Stroke survivor."
            delay={0}
            fontSize={64}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: The gap */}
      <Sequence from={Math.round(fps * 5.5)} durationInFrames={fps * 3}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <AnimatedText
            text="Her next check-up? 6 weeks away."
            highlight="6 weeks away."
            delay={0}
            fontSize={58}
            subtitle="No one is tracking her recovery at home"
          />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
