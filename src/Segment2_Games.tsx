import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  Img,
  staticFile,
} from "remotion";
import { fontFamily } from "./fonts";

const IridescentBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const slowDrift = frame * 0.2;

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(
            ellipse at ${50 + Math.sin(slowDrift * 0.008) * 12}% ${50 + Math.cos(slowDrift * 0.01) * 10}%,
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
  const particles = Array.from({ length: 30 }, (_, i) => {
    const x = (i * 41 + frame * 0.08 * (i % 3 + 1)) % 100;
    const y = (i * 59 + frame * 0.04 * (i % 4 + 1)) % 100;
    const opacity = 0.12 + Math.sin(frame * 0.02 + i) * 0.08;
    const size = 1 + (i % 2);
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

const HUDCorners: React.FC<{ opacity: number }> = ({ opacity }) => {
  const cornerStyle: React.CSSProperties = {
    position: "absolute",
    width: 24,
    height: 24,
    opacity,
  };

  const borderColor = "#38bdf855";

  return (
    <>
      <div
        style={{
          ...cornerStyle,
          top: 20,
          left: 20,
          borderTop: `2px solid ${borderColor}`,
          borderLeft: `2px solid ${borderColor}`,
        }}
      />
      <div
        style={{
          ...cornerStyle,
          top: 20,
          right: 20,
          borderTop: `2px solid ${borderColor}`,
          borderRight: `2px solid ${borderColor}`,
        }}
      />
      <div
        style={{
          ...cornerStyle,
          bottom: 20,
          left: 20,
          borderBottom: `2px solid ${borderColor}`,
          borderLeft: `2px solid ${borderColor}`,
        }}
      />
      <div
        style={{
          ...cornerStyle,
          bottom: 20,
          right: 20,
          borderBottom: `2px solid ${borderColor}`,
          borderRight: `2px solid ${borderColor}`,
        }}
      />
    </>
  );
};

const GameCard: React.FC<{
  image: string;
  title: string;
  subtitle: string;
  delay: number;
  position: "left" | "center" | "right";
}> = ({ image, title, subtitle, delay, position }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - delay;
  if (localFrame < 0) return null;

  const progress = interpolate(localFrame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const scale = interpolate(progress, [0, 1], [0.9, 1]);
  const translateY = interpolate(progress, [0, 1], [30, 0]);

  const xOffset =
    position === "left" ? -340 : position === "right" ? 340 : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(calc(-50% + ${xOffset}px), calc(-50% + ${translateY}px)) scale(${scale})`,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
      }}
    >
      {/* Frame border */}
      <div
        style={{
          position: "relative",
          padding: 3,
          background: "linear-gradient(135deg, #38bdf8, #1e3a5f, #60a5fa)",
          borderRadius: 12,
        }}
      >
        <div
          style={{
            borderRadius: 9,
            overflow: "hidden",
            width: 280,
            height: 180,
            position: "relative",
          }}
        >
          <Img
            src={staticFile(image)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          {/* Subtle overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, transparent 60%, rgba(6,14,26,0.6) 100%)",
            }}
          />
        </div>
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily,
          fontSize: 20,
          fontWeight: 600,
          color: "white",
          margin: 0,
          letterSpacing: "-0.3px",
        }}
      >
        {title}
      </h3>

      {/* Subtitle */}
      <p
        style={{
          fontFamily,
          fontSize: 13,
          fontWeight: 300,
          color: "#64a3c8",
          margin: 0,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
        }}
      >
        {subtitle}
      </p>
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

const HeaderBadge: React.FC<{ text: string; delay: number }> = ({
  text,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - delay;
  if (localFrame < 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 40,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <PulsingDot color="#22d3ee" delay={delay} />
      <TypewriterText
        text={text}
        startFrame={delay}
        speed={1.8}
        style={{ fontSize: 11, letterSpacing: "2.5px", color: "#22d3ee" }}
      />
    </div>
  );
};

const ThreeGamesShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerDelay = 0;
  const card1Delay = Math.round(fps * 0.3);
  const card2Delay = Math.round(fps * 0.6);
  const card3Delay = Math.round(fps * 0.9);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <HUDCorners
        opacity={interpolate(frame, [0, fps * 0.5], [0, 0.6], {
          extrapolateRight: "clamp",
        })}
      />
      <HeaderBadge
        text="3 games — 5 minutes — full motor profile"
        delay={headerDelay}
      />

      <GameCard
        image="Levers.jpeg"
        title="Switches"
        subtitle="Reaction time · bimanual"
        delay={card1Delay}
        position="left"
      />
      <GameCard
        image="Pills.jpeg"
        title="Pillbox"
        subtitle="Pinch grip · fine motor"
        delay={card2Delay}
        position="center"
      />
      <GameCard
        image="Water.jpeg"
        title="Water Jug"
        subtitle="Pronation · supination"
        delay={card3Delay}
        position="right"
      />

      {/* Bottom tagline */}
      <BottomTagline />
    </AbsoluteFill>
  );
};

const BottomTagline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        position: "absolute",
        bottom: 45,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      <SlideInText delay={Math.round(fps * 1.8)} direction="up">
        <p
          style={{
            fontFamily,
            fontSize: 16,
            fontWeight: 300,
            color: "#94a3b8",
            margin: 0,
          }}
        >
          No gloves. No sensors.{" "}
          <span style={{ color: "#e2e8f0", fontWeight: 500 }}>
            Just a webcam.
          </span>
        </p>
      </SlideInText>
      <SlideInText delay={Math.round(fps * 2.3)} direction="up">
        <TypewriterText
          text="[webrtc · cv pipeline · no sdk · any device]"
          startFrame={Math.round(fps * 2.4)}
          speed={2}
          style={{ fontSize: 10, color: "#4a9eff55" }}
        />
      </SlideInText>
    </div>
  );
};

const SingleGameFocus: React.FC<{
  image: string;
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
}> = ({ image, title, description, metric, metricLabel }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const imgProgress = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  const textProgress = interpolate(frame, [fps * 0.3, fps * 0.7], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const metricProgress = interpolate(frame, [fps * 0.8, fps * 1.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 60,
        padding: "0 80px",
      }}
    >
      {/* Image */}
      <div
        style={{
          opacity: imgProgress,
          transform: `scale(${interpolate(imgProgress, [0, 1], [0.95, 1])})`,
        }}
      >
        <div
          style={{
            padding: 3,
            background: "linear-gradient(135deg, #38bdf8, #1e3a5f, #60a5fa)",
            borderRadius: 16,
          }}
        >
          <div
            style={{
              borderRadius: 13,
              overflow: "hidden",
              width: 520,
              height: 340,
            }}
          >
            <Img
              src={staticFile(image)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        </div>
      </div>

      {/* Text */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          maxWidth: 380,
          opacity: textProgress,
          transform: `translateX(${interpolate(textProgress, [0, 1], [20, 0])}px)`,
        }}
      >
        <h2
          style={{
            fontFamily,
            fontSize: 42,
            fontWeight: 600,
            color: "white",
            margin: 0,
            letterSpacing: "-0.5px",
          }}
        >
          {title}
        </h2>
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
          {description}
        </p>

        {/* Metric */}
        <div
          style={{
            marginTop: 12,
            opacity: metricProgress,
            transform: `translateY(${interpolate(metricProgress, [0, 1], [10, 0])}px)`,
          }}
        >
          <span
            style={{
              fontFamily,
              fontSize: 48,
              fontWeight: 700,
              background:
                "linear-gradient(135deg, #60a5fa, #38bdf8, #22d3ee)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {metric}
          </span>
          <p
            style={{
              fontFamily,
              fontSize: 12,
              fontWeight: 400,
              color: "#4a9eff88",
              margin: "4px 0 0 0",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            {metricLabel}
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Segment2Games: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeOut = interpolate(
    frame,
    [durationInFrames - fps * 0.4, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <IridescentBackground />
      <Particles />

      {/* Scene 1: Three games overview (0-4s) */}
      <Sequence from={0} durationInFrames={fps * 4}>
        <ThreeGamesShowcase />
      </Sequence>

      {/* Scene 2: Switches detail (4-7s) */}
      <Sequence from={fps * 4} durationInFrames={fps * 3}>
        <SingleGameFocus
          image="Levers.jpeg"
          title="Switches"
          description="Visual stimulus → pull the lever. Measures reaction time, bimanual symmetry and vertical reach."
          metric="<200ms"
          metricLabel="reaction time captured"
        />
      </Sequence>

      {/* Scene 3: Pillbox detail (7-10s) */}
      <Sequence from={fps * 7} durationInFrames={fps * 3}>
        <SingleGameFocus
          image="Pills.jpeg"
          title="Pillbox"
          description="Pinch, grab, classify. Real finger tracking detects tremor, precision and error rate in real-time."
          metric="0.1mm"
          metricLabel="pinch grip resolution"
        />
      </Sequence>

      {/* Scene 4: Water Jug detail (10-13s) */}
      <Sequence from={fps * 10} durationInFrames={fps * 3}>
        <SingleGameFocus
          image="Water.jpeg"
          title="Water Jug"
          description="Rotate your wrist to pour without spilling. Captures pronation, supination and tremor analysis."
          metric="360°"
          metricLabel="wrist rotation range"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
