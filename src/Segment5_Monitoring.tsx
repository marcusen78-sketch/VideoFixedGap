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

const EKGLine: React.FC<{
  color: string;
  progress: number;
  hasHeartbeat: boolean;
  flatline?: boolean;
}> = ({ color, progress, hasHeartbeat, flatline }) => {
  const frame = useCurrentFrame();
  const width = interpolate(progress, [0, 1], [0, 100]);

  const generatePath = () => {
    const points: string[] = [];
    const totalPoints = 200;
    const visiblePoints = Math.floor(totalPoints * (width / 100));

    for (let i = 0; i < visiblePoints; i++) {
      const x = (i / totalPoints) * 1280;
      let y = 357;

      if (hasHeartbeat && !flatline) {
        const beatPos = 0.35;
        const normalizedI = i / totalPoints;
        const distFromBeat = Math.abs(normalizedI - beatPos);

        if (distFromBeat < 0.02) {
          y -= 80 * Math.exp(-(distFromBeat * distFromBeat) / 0.0001);
        } else if (distFromBeat > 0.02 && distFromBeat < 0.04) {
          y += 30 * Math.exp(-((distFromBeat - 0.03) * (distFromBeat - 0.03)) / 0.0001);
        } else if (distFromBeat > 0.04 && distFromBeat < 0.06) {
          y -= 120 * Math.exp(-((distFromBeat - 0.05) * (distFromBeat - 0.05)) / 0.00008);
        } else if (distFromBeat > 0.06 && distFromBeat < 0.08) {
          y += 40 * Math.exp(-((distFromBeat - 0.07) * (distFromBeat - 0.07)) / 0.0001);
        }
      }

      if (flatline) {
        y = 357 + Math.sin(i * 0.1 + frame * 0.02) * 0.5;
      }

      points.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }

    return points.join(" ");
  };

  return (
    <svg
      width="1280"
      height="714"
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      <path
        d={generatePath()}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        opacity={0.9}
      />
      <path
        d={generatePath()}
        fill="none"
        stroke={color}
        strokeWidth={6}
        opacity={0.15}
        filter="blur(4px)"
      />
    </svg>
  );
};

const ContinuousDataLine: React.FC<{ progress: number }> = ({ progress }) => {
  const frame = useCurrentFrame();
  const width = interpolate(progress, [0, 1], [0, 100]);

  const generatePath = () => {
    const points: string[] = [];
    const totalPoints = 200;
    const visiblePoints = Math.floor(totalPoints * (width / 100));

    for (let i = 0; i < visiblePoints; i++) {
      const x = (i / totalPoints) * 1280;
      const normalizedI = i / totalPoints;
      const wave1 = Math.sin((normalizedI * 8 + frame * 0.04) * Math.PI) * 25;
      const wave2 = Math.sin((normalizedI * 12 + frame * 0.06) * Math.PI) * 12;
      const wave3 = Math.sin((normalizedI * 3 + frame * 0.02) * Math.PI) * 35;
      const trend = -normalizedI * 20;
      const y = 420 + wave1 + wave2 + wave3 + trend;

      points.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }

    return points.join(" ");
  };

  const pathD = generatePath();

  return (
    <svg
      width="1280"
      height="714"
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      <defs>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="1" />
        </linearGradient>
      </defs>
      <path
        d={pathD}
        fill="none"
        stroke="url(#lineGrad)"
        strokeWidth={3}
      />
      <path
        d={pathD}
        fill="none"
        stroke="#22d3ee"
        strokeWidth={8}
        opacity={0.12}
        filter="blur(4px)"
      />
    </svg>
  );
};

const LiveDot: React.FC<{ x: number; y: number; delay: number }> = ({
  x,
  y,
  delay,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - delay;
  if (localFrame < 0) return null;

  const pulse = Math.sin(localFrame * 0.2) * 0.3 + 0.7;
  const ringScale = 1 + Math.sin(localFrame * 0.15) * 0.4;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          border: "2px solid #22d3ee",
          opacity: 0.3,
          transform: `scale(${ringScale})`,
          position: "absolute",
          top: -12,
          left: -12,
        }}
      />
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          backgroundColor: "#22d3ee",
          boxShadow: "0 0 12px #22d3ee, 0 0 24px #22d3ee44",
          opacity: pulse,
          position: "absolute",
          top: -5,
          left: -5,
        }}
      />
    </div>
  );
};

const GapCounter: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - startFrame;
  if (localFrame < 0) return null;

  const countProgress = interpolate(localFrame, [0, fps * 1.5], [0, 42], {
    extrapolateRight: "clamp",
  });

  const opacity = interpolate(localFrame, [0, fps * 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  const displayNum = Math.floor(countProgress);

  return (
    <div
      style={{
        position: "absolute",
        right: 120,
        top: "50%",
        transform: "translateY(-50%)",
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <span
        style={{
          fontFamily,
          fontSize: 100,
          fontWeight: 800,
          color: "#e63946",
          textShadow: "0 0 30px #e6394644",
          letterSpacing: "-4px",
        }}
      >
        {displayNum}
      </span>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: 12,
          letterSpacing: "3px",
          color: "#e6394688",
          textTransform: "uppercase",
        }}
      >
        days without data
      </span>
    </div>
  );
};

const FlickerText: React.FC<{
  text: string;
  delay: number;
  color?: string;
  fontSize?: number;
  bold?: boolean;
}> = ({ text, delay, color = "white", fontSize = 48, bold }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - delay;
  if (localFrame < 0) return null;

  const flickerDuration = fps * 0.4;
  let opacity = 1;

  if (localFrame < flickerDuration) {
    const flickerProgress = localFrame / flickerDuration;
    const flickers = [0.2, 0.8, 0.3, 0.9, 0.5, 1.0];
    const idx = Math.min(
      Math.floor(flickerProgress * flickers.length),
      flickers.length - 1
    );
    opacity = flickers[idx];
  }

  const scale = interpolate(localFrame, [0, fps * 0.3], [1.05, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <span
      style={{
        fontFamily,
        fontSize,
        fontWeight: bold ? 800 : 300,
        color,
        opacity,
        transform: `scale(${scale})`,
        display: "inline-block",
        textShadow: color !== "white" ? `0 0 20px ${color}44` : "none",
      }}
    >
      {text}
    </span>
  );
};

const OfflineScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lineProgress = interpolate(frame, [fps * 0.5, fps * 3], [0, 0.85], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const headerOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  const textOpacity = interpolate(frame, [fps * 0.8, fps * 1.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subTextOpacity = interpolate(frame, [fps * 2, fps * 2.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Red vignette
  const vignetteOpacity = interpolate(frame, [fps * 1, fps * 3], [0, 0.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#050505" }}>
      {/* Red vignette edges */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 40%, #e6394615 70%, #e6394622 100%)",
          opacity: vignetteOpacity,
        }}
      />

      {/* Header badge */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: "50%",
          transform: "translateX(-50%)",
          opacity: headerOpacity,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "#e63946",
            boxShadow: "0 0 8px #e63946",
            opacity: Math.sin(frame * 0.15) * 0.4 + 0.6,
          }}
        />
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 12,
            letterSpacing: "3px",
            color: "#e63946",
            textTransform: "uppercase",
          }}
        >
          monitoring — offline — no signal
        </span>
      </div>

      {/* EKG flatline */}
      <EKGLine
        color="#e63946"
        progress={lineProgress}
        hasHeartbeat={true}
        flatline={false}
      />

      {/* Main text */}
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 140,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          opacity: textOpacity,
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 13,
            letterSpacing: "2px",
            color: "#666",
            textTransform: "uppercase",
          }}
        >
          last data point:
        </span>
        <FlickerText
          text="6 weeks ago."
          delay={Math.round(fps * 1)}
          color="#e63946"
          fontSize={56}
          bold
        />
      </div>

      {/* Sub text */}
      <div
        style={{
          position: "absolute",
          left: 100,
          bottom: 140,
          opacity: subTextOpacity,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <p
          style={{
            fontFamily,
            fontSize: 22,
            fontWeight: 300,
            color: "#666",
            margin: 0,
            fontStyle: "italic",
          }}
        >
          Recovery doesn't pause between appointments.
        </p>
        <p
          style={{
            fontFamily,
            fontSize: 22,
            fontWeight: 300,
            color: "#888",
            margin: 0,
            fontStyle: "italic",
          }}
        >
          But <span style={{ color: "#e63946" }}>monitoring does.</span>
        </p>
      </div>

      {/* Gap counter */}
      <GapCounter startFrame={Math.round(fps * 1.2)} />
    </AbsoluteFill>
  );
};

const TransitionFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const flashOpacity = interpolate(
    frame,
    [0, fps * 0.1, fps * 0.3, fps * 0.6],
    [0, 1, 0.8, 0],
    { extrapolateRight: "clamp" }
  );

  const lineWidth = interpolate(frame, [0, fps * 0.4], [0, 120], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {/* White flash */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#22d3ee",
          opacity: flashOpacity * 0.3,
        }}
      />
      {/* Horizontal expanding line */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: `${lineWidth}%`,
          height: 3,
          background:
            "linear-gradient(90deg, transparent, #22d3ee, #fff, #22d3ee, transparent)",
          boxShadow: "0 0 20px #22d3ee, 0 0 60px #22d3ee44",
          opacity: interpolate(frame, [fps * 0.1, fps * 0.6], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
    </AbsoluteFill>
  );
};

const OnlineScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lineProgress = interpolate(frame, [fps * 0.3, fps * 3.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const headerOpacity = interpolate(frame, [fps * 0.2, fps * 0.6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const mainTextProgress = spring({
    frame: Math.max(0, frame - Math.round(fps * 0.4)),
    fps,
    config: { damping: 60, stiffness: 150, mass: 0.6 },
  });

  const subProgress = spring({
    frame: Math.max(0, frame - Math.round(fps * 1.8)),
    fps,
    config: { damping: 80, stiffness: 180, mass: 0.5 },
  });

  const badgeProgress = spring({
    frame: Math.max(0, frame - Math.round(fps * 2.8)),
    fps,
    config: { damping: 80, stiffness: 200, mass: 0.5 },
  });

  // Particle dots floating up
  const particles = Array.from({ length: 15 }, (_, i) => {
    const x = 15 + (i * 67) % 85;
    const speed = 0.3 + (i % 4) * 0.15;
    const y = (100 - ((frame * speed + i * 30) % 120));
    const opacity = y > 0 && y < 100
      ? interpolate(y, [0, 20, 80, 100], [0, 0.4, 0.4, 0])
      : 0;
    const size = 2 + (i % 3);
    return { x, y, opacity, size };
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 50% 60%, #0a1e2e 0%, #060e1a 50%, #030508 100%)",
      }}
    >
      {/* Floating particles */}
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
            backgroundColor: "#22d3ee",
            opacity: p.opacity,
          }}
        />
      ))}

      {/* Blue ambient glow */}
      <div
        style={{
          position: "absolute",
          bottom: "30%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, #22d3ee08 0%, transparent 70%)",
          opacity: headerOpacity,
        }}
      />

      {/* Header badge */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: "50%",
          transform: "translateX(-50%)",
          opacity: headerOpacity,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "#22d3ee",
            boxShadow: "0 0 8px #22d3ee",
          }}
        />
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 12,
            letterSpacing: "3px",
            color: "#22d3ee",
            textTransform: "uppercase",
          }}
        >
          monitoring — online — live
        </span>
      </div>

      {/* Continuous data line */}
      <ContinuousDataLine progress={lineProgress} />

      {/* Live dot at end of line */}
      {lineProgress > 0.3 && (
        <LiveDot
          x={lineProgress * 1280}
          y={420 +
            Math.sin((lineProgress * 8 + frame * 0.04) * Math.PI) * 25 +
            Math.sin((lineProgress * 12 + frame * 0.06) * Math.PI) * 12 +
            Math.sin((lineProgress * 3 + frame * 0.02) * Math.PI) * 35 +
            -lineProgress * 20}
          delay={0}
        />
      )}

      {/* Main text */}
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 130,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          opacity: mainTextProgress,
          transform: `translateY(${interpolate(mainTextProgress, [0, 1], [20, 0])}px)`,
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 13,
            letterSpacing: "2px",
            color: "#64748b",
            textTransform: "uppercase",
          }}
        >
          last data point:
        </span>
        <h1
          style={{
            fontFamily,
            fontSize: 64,
            fontWeight: 800,
            margin: 0,
            letterSpacing: "-2px",
            background: "linear-gradient(135deg, #22d3ee, #38bdf8, #60a5fa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          This morning.
        </h1>
      </div>

      {/* Sub text */}
      <div
        style={{
          position: "absolute",
          left: 100,
          bottom: 160,
          opacity: subProgress,
          transform: `translateY(${interpolate(subProgress, [0, 1], [15, 0])}px)`,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <p
          style={{
            fontFamily,
            fontSize: 22,
            fontWeight: 300,
            color: "#94a3b8",
            margin: 0,
          }}
        >
          Every session. Every metric. Every day.
        </p>
        <p
          style={{
            fontFamily,
            fontSize: 22,
            fontWeight: 500,
            color: "#e2e8f0",
            margin: 0,
          }}
        >
          The gap <span style={{ color: "#22d3ee" }}>doesn't exist anymore.</span>
        </p>
      </div>

      {/* Bottom badges */}
      <div
        style={{
          position: "absolute",
          bottom: 50,
          left: "50%",
          transform: "translateX(-50%)",
          opacity: badgeProgress,
          display: "flex",
          gap: 24,
        }}
      >
        {["CONTINUOUS", "OBJECTIVE", "AUTOMATIC"].map((label, i) => (
          <div
            key={label}
            style={{
              padding: "6px 14px",
              border: "1px solid #22d3ee33",
              borderRadius: 6,
              opacity: interpolate(
                badgeProgress,
                [0, 0.5 + i * 0.15, 0.7 + i * 0.15],
                [0, 0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              ),
            }}
          >
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                letterSpacing: "2px",
                color: "#22d3ee",
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const Segment5Monitoring: React.FC = () => {
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
      {/* Scene 1: Offline / The Problem (0–5s) */}
      <Sequence from={0} durationInFrames={Math.round(fps * 5)}>
        <OfflineScene />
      </Sequence>

      {/* Transition flash (5s–5.6s) */}
      <Sequence from={Math.round(fps * 5)} durationInFrames={Math.round(fps * 0.6)}>
        <TransitionFlash />
      </Sequence>

      {/* Scene 2: Online / The Solution (5.3s–11s) */}
      <Sequence from={Math.round(fps * 5.3)} durationInFrames={Math.round(fps * 5.7)}>
        <OnlineScene />
      </Sequence>
    </AbsoluteFill>
  );
};
