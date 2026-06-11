import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
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

const SlideInText: React.FC<{
  children: React.ReactNode;
  delay: number;
  direction?: "left" | "right" | "up";
  style?: React.CSSProperties;
}> = ({ children, delay, direction = "up", style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - delay;
  if (localFrame < 0) return null;

  const progress = spring({
    frame: localFrame,
    fps,
    config: { damping: 80, stiffness: 200, mass: 0.5 },
  });

  const transforms = {
    left: `translateX(${interpolate(progress, [0, 1], [-40, 0])}px)`,
    right: `translateX(${interpolate(progress, [0, 1], [40, 0])}px)`,
    up: `translateY(${interpolate(progress, [0, 1], [25, 0])}px)`,
  };

  return (
    <div
      style={{
        opacity: progress,
        transform: transforms[direction],
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const TypewriterText: React.FC<{
  text: string;
  startFrame: number;
  speed?: number;
  style?: React.CSSProperties;
}> = ({ text, startFrame, speed = 1.5, style }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  if (localFrame < 0) return null;

  const charsToShow = Math.min(Math.floor(localFrame * speed), text.length);
  const displayText = text.slice(0, charsToShow);
  const showCursor = localFrame % 16 < 10 && charsToShow < text.length;

  return (
    <span
      style={{
        fontFamily: "monospace",
        fontSize: 13,
        letterSpacing: "1.5px",
        color: "#4a9eff",
        textTransform: "uppercase" as const,
        ...style,
      }}
    >
      {displayText}
      {showCursor && (
        <span style={{ color: "#00d4ff", opacity: 0.8 }}>▌</span>
      )}
    </span>
  );
};

const PulsingDot: React.FC<{ color: string; delay: number }> = ({
  color,
  delay,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - delay;
  if (localFrame < 0) return null;

  const pulse = Math.sin(localFrame * 0.15) * 0.3 + 0.7;

  return (
    <div
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: color,
        opacity: pulse,
        boxShadow: `0 0 8px ${color}`,
      }}
    />
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <SlideInText delay={Math.round(fps * 0.2)} direction="up">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <PulsingDot color="#22d3ee" delay={Math.round(fps * 0.2)} />
                <TypewriterText
                  text="patient profile"
                  startFrame={Math.round(fps * 0.3)}
                />
              </div>
            </SlideInText>
            <SlideInText delay={Math.round(fps * 0.5)} direction="up">
              <h1
                style={{
                  fontFamily,
                  fontSize: 78,
                  fontWeight: 300,
                  color: "white",
                  margin: 0,
                  letterSpacing: "-1px",
                }}
              >
                Meet{" "}
                <span
                  style={{
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #60a5fa, #38bdf8, #22d3ee)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Maria.
                </span>
              </h1>
            </SlideInText>
          </div>
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <SlideInText delay={0} direction="up">
              <h1
                style={{
                  fontFamily,
                  fontSize: 64,
                  fontWeight: 300,
                  color: "white",
                  margin: 0,
                  letterSpacing: "-1px",
                }}
              >
                71 years old.{" "}
                <span
                  style={{
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #60a5fa, #38bdf8, #22d3ee)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Stroke survivor.
                </span>
              </h1>
            </SlideInText>
            <SlideInText delay={Math.round(fps * 0.6)} direction="up">
              <TypewriterText
                text="post-stroke rehabilitation · home-based recovery"
                startFrame={fps * 3 + Math.round(fps * 0.7)}
                speed={2}
                style={{ fontSize: 11, color: "#4a9eff66" }}
              />
            </SlideInText>
          </div>
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <SlideInText delay={0} direction="up">
              <h1
                style={{
                  fontFamily,
                  fontSize: 58,
                  fontWeight: 300,
                  color: "white",
                  margin: 0,
                  letterSpacing: "-1px",
                }}
              >
                Her next check-up?{" "}
                <span
                  style={{
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #60a5fa, #38bdf8, #22d3ee)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  6 weeks away.
                </span>
              </h1>
            </SlideInText>
            <SlideInText delay={Math.round(fps * 0.6)} direction="up">
              <p
                style={{
                  fontFamily,
                  fontSize: 18,
                  fontWeight: 300,
                  color: "#94a3b8",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                No one is tracking her recovery at home
              </p>
            </SlideInText>
            <SlideInText delay={Math.round(fps * 1.2)} direction="up">
              <TypewriterText
                text="[blind spot · no data · no early warning]"
                startFrame={Math.round(fps * 5.5) + Math.round(fps * 1.3)}
                speed={2}
                style={{ fontSize: 11, color: "#4a9eff66" }}
              />
            </SlideInText>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
