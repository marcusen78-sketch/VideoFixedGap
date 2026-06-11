import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Sequence,
  Img,
  staticFile,
  spring,
} from "remotion";
import { fontFamily } from "./fonts";

const DarkBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = frame * 0.15;

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(
            ellipse at ${50 + Math.sin(drift * 0.01) * 8}% ${50 + Math.cos(drift * 0.013) * 6}%,
            #0f1e2e 0%,
            #080f1a 40%,
            #030609 100%
          )
        `,
      }}
    />
  );
};

const ScanLine: React.FC<{ progress: number }> = ({ progress }) => {
  const y = interpolate(progress, [0, 1], [0, 100]);
  const opacity = interpolate(progress, [0, 0.1, 0.9, 1], [0, 0.6, 0.6, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: `${y}%`,
        left: 0,
        right: 0,
        height: 2,
        opacity,
        background:
          "linear-gradient(90deg, transparent 5%, #00d4ff44 20%, #00d4ff 50%, #00d4ff44 80%, transparent 95%)",
        boxShadow: "0 0 12px #00d4ff66",
      }}
    />
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

const GlowBorder: React.FC<{
  progress: number;
  children: React.ReactNode;
  tiltDirection?: "left" | "right";
}> = ({ progress, children, tiltDirection = "right" }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const startRotateY = tiltDirection === "right" ? 15 : -15;
  const rotateY = interpolate(progress, [0, 1], [startRotateY, 0]);
  const rotateX = interpolate(progress, [0, 1], [10, 0]);
  const scale = interpolate(progress, [0, 1], [0.92, 1]);

  return (
    <div
      style={{
        opacity,
        transform: `perspective(1200px) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        position: "relative",
        borderRadius: 12,
        padding: 2,
        background: `linear-gradient(135deg, #00d4ff33, #1e3a5f66, #4a9eff33)`,
        boxShadow: `0 0 30px #00d4ff15, 0 4px 20px rgba(0,0,0,0.5)`,
      }}
    >
      <div style={{ borderRadius: 10, overflow: "hidden" }}>{children}</div>
    </div>
  );
};

const TriageScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const imgProgress = interpolate(frame, [0, fps * 0.6], [0, 1], {
    extrapolateRight: "clamp",
  });

  const scanProgress = interpolate(frame, [fps * 0.3, fps * 2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: "0 50px",
      }}
    >
      {/* Left: Dashboard image */}
      <div
        style={{
          flex: "0 0 55%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        <GlowBorder progress={imgProgress} tiltDirection="right">
          <div style={{ position: "relative" }}>
            <Img
              src={staticFile("Dashboard2.jpeg")}
              style={{
                width: 660,
                height: 420,
                objectFit: "cover",
                objectPosition: "top",
              }}
            />
            {/* UI processing simulated flash */}
            <div style={{
              position: "absolute", top: "20%", right: "10%", width: 100, height: 60,
              background: "rgba(34, 211, 238, 0.4)", filter: "blur(8px)", mixBlendMode: "screen",
              opacity: Math.sin(frame * 0.2) > 0.8 ? 1 : 0
            }} />
          </div>
        </GlowBorder>
        <ScanLine progress={scanProgress} />
      </div>

      {/* Right: Text overlays */}
      <div
        style={{
          flex: "0 0 45%",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          paddingLeft: 40,
        }}
      >
        <SlideInText delay={Math.round(fps * 0.4)} direction="right">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <PulsingDot color="#e63946" delay={Math.round(fps * 0.4)} />
            <TypewriterText
              text="intelligent triage"
              startFrame={Math.round(fps * 0.5)}
            />
          </div>
        </SlideInText>

        <SlideInText delay={Math.round(fps * 0.9)} direction="right">
          <h2
            style={{
              fontFamily,
              fontSize: 44,
              fontWeight: 700,
              color: "white",
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: "-1px",
            }}
          >
            AI does the
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #60a5fa, #22d3ee)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              prioritization.
            </span>
          </h2>
        </SlideInText>

        <SlideInText delay={Math.round(fps * 1.5)} direction="right">
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
            24 patients. 9 alerts. 5 deteriorating.
            <br />
            <span style={{ color: "#e2e8f0" }}>
              Know who needs you — before they call.
            </span>
          </p>
        </SlideInText>

        <SlideInText delay={Math.round(fps * 2.2)} direction="right">
          <div
            style={{
              marginTop: 8,
              padding: "10px 16px",
              background: "rgba(0,212,255,0.06)",
              border: "1px solid #00d4ff22",
              borderRadius: 8,
            }}
          >
            <p
              style={{
                fontFamily,
                fontSize: 14,
                fontWeight: 400,
                color: "#38bdf8",
                margin: 0,
                fontStyle: "italic",
              }}
            >
              "Reactive → Proactive medicine."
            </p>
          </div>
        </SlideInText>

        <SlideInText delay={Math.round(fps * 2.8)} direction="right">
          <TypewriterText
            text="[daily data · early detection · zero friction]"
            startFrame={Math.round(fps * 3)}
            speed={2}
            style={{ fontSize: 11, color: "#4a9eff66" }}
          />
        </SlideInText>
      </div>
    </AbsoluteFill>
  );
};

const PatientDetailScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const imgProgress = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  const scanProgress = interpolate(frame, [fps * 0.2, fps * 1.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: "0 50px",
      }}
    >
      {/* Left: Text overlays */}
      <div
        style={{
          flex: "0 0 42%",
          display: "flex",
          flexDirection: "column",
          gap: 18,
          paddingRight: 30,
        }}
      >
        <SlideInText delay={Math.round(fps * 0.3)} direction="left">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <PulsingDot color="#22d3ee" delay={Math.round(fps * 0.3)} />
            <TypewriterText
              text="patient deep-dive"
              startFrame={Math.round(fps * 0.4)}
            />
          </div>
        </SlideInText>

        <SlideInText delay={Math.round(fps * 0.8)} direction="left">
          <h2
            style={{
              fontFamily,
              fontSize: 42,
              fontWeight: 700,
              color: "white",
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: "-1px",
            }}
          >
            Not game scores.
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #f59e0b, #f97316)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Clinical scales.
            </span>
          </h2>
        </SlideInText>

        <SlideInText delay={Math.round(fps * 1.4)} direction="left">
          <p
            style={{
              fontFamily,
              fontSize: 17,
              fontWeight: 300,
              color: "#94a3b8",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Pinch grip → FMA-UE. Rotation → DASH.
            <br />
            <span style={{ color: "#e2e8f0" }}>
              Kinematics translated to clinical gold standard.
            </span>
          </p>
        </SlideInText>

        <SlideInText delay={Math.round(fps * 2)} direction="left">
          <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
            <MetricBadge label="PINCH" value="47.5" delay={Math.round(fps * 2.1)} />
            <MetricBadge label="EXTENSION" value="51.6" delay={Math.round(fps * 2.3)} />
            <MetricBadge label="ROTATION" value="44.1" delay={Math.round(fps * 2.5)} />
          </div>
        </SlideInText>

        <SlideInText delay={Math.round(fps * 3)} direction="left">
          <div
            style={{
              marginTop: 4,
              padding: "10px 16px",
              background: "rgba(245,158,11,0.06)",
              border: "1px solid #f59e0b22",
              borderRadius: 8,
            }}
          >
            <p
              style={{
                fontFamily,
                fontSize: 14,
                fontWeight: 400,
                color: "#fbbf24",
                margin: 0,
                fontStyle: "italic",
              }}
            >
              "Objective data. Not 'how are you feeling?'"
            </p>
          </div>
        </SlideInText>

        <SlideInText delay={Math.round(fps * 3.5)} direction="left">
          <TypewriterText
            text="[tremor · spasticity · fatigue · disinhibition · detected daily]"
            startFrame={Math.round(fps * 3.6)}
            speed={2}
            style={{ fontSize: 11, color: "#4a9eff66" }}
          />
        </SlideInText>
      </div>

      {/* Right: Dashboard image */}
      <div
        style={{
          flex: "0 0 58%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        <GlowBorder progress={imgProgress} tiltDirection="left">
          <div style={{ position: "relative" }}>
            <Img
              src={staticFile("Dashboard1.jpeg")}
              style={{
                width: 700,
                height: 440,
                objectFit: "cover",
                objectPosition: "top",
              }}
            />
            {/* UI processing simulated flash */}
            <div style={{
              position: "absolute", bottom: "30%", left: "15%", width: 120, height: 40,
              background: "rgba(34, 211, 238, 0.4)", filter: "blur(10px)", mixBlendMode: "screen",
              opacity: Math.sin(frame * 0.15) > 0.7 ? 1 : 0
            }} />
          </div>
        </GlowBorder>
        <ScanLine progress={scanProgress} />
      </div>
    </AbsoluteFill>
  );
};

const MetricBadge: React.FC<{
  label: string;
  value: string;
  delay: number;
}> = ({ label, value, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - delay;
  if (localFrame < 0) return null;

  const opacity = interpolate(localFrame, [0, fps * 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  const scale = interpolate(localFrame, [0, fps * 0.3], [0.8, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "8px 14px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid #ffffff11",
        borderRadius: 8,
        gap: 4,
      }}
    >
      <span
        style={{
          fontFamily,
          fontSize: 22,
          fontWeight: 700,
          color: "#f59e0b",
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: 9,
          letterSpacing: "1.5px",
          color: "#64748b",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
};

export const Segment3Dashboard: React.FC = () => {
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
      <DarkBackground />

      {/* Scene 1: Triage View (0-6s) */}
      <Sequence from={0} durationInFrames={fps * 6}>
        <TriageScene />
      </Sequence>

      {/* Scene 2: Patient Detail (6-12s) */}
      <Sequence from={fps * 6} durationInFrames={fps * 6}>
        <PatientDetailScene />
      </Sequence>
    </AbsoluteFill>
  );
};
