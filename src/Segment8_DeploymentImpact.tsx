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

// Warp speed grid background with perspective
const WarpSpeedGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const speed = frame * 2;

  const horizontalLines = Array.from({ length: 12 }, (_, i) => {
    const baseY = (i / 12) * 100;
    const perspective = Math.pow((i + 1) / 12, 2);
    const opacity = 0.05 + perspective * 0.15;
    const yPos = 50 + (baseY - 50) * (0.3 + perspective * 0.7);

    return { y: yPos, opacity, width: 40 + perspective * 60 };
  });

  const verticalLines = Array.from({ length: 20 }, (_, i) => {
    const baseX = ((i * 53 + speed * 0.5) % 120) - 10;
    const opacity = 0.04 + Math.sin(i * 0.7) * 0.03;

    return { x: baseX, opacity };
  });

  return (
    <AbsoluteFill>
      {/* Horizontal perspective lines */}
      {horizontalLines.map((line, i) => (
        <div
          key={`h${i}`}
          style={{
            position: "absolute",
            left: `${50 - line.width / 2}%`,
            top: `${line.y}%`,
            width: `${line.width}%`,
            height: 1,
            background: `linear-gradient(90deg, transparent, rgba(34, 211, 238, ${line.opacity}), transparent)`,
          }}
        />
      ))}
      {/* Vertical flowing lines */}
      {verticalLines.map((line, i) => (
        <div
          key={`v${i}`}
          style={{
            position: "absolute",
            left: `${line.x}%`,
            top: 0,
            bottom: 0,
            width: 1,
            background: `linear-gradient(180deg, transparent 20%, rgba(34, 211, 238, ${line.opacity}) 50%, transparent 80%)`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// Converging light fibers
const LightFibers: React.FC<{ progress: number }> = ({ progress }) => {
  const frame = useCurrentFrame();

  const fibers = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const startX = 640 + Math.cos(angle) * 800;
    const startY = 357 + Math.sin(angle) * 500;
    const endX = 640;
    const endY = 357;

    const currentX = interpolate(progress, [0, 1], [startX, endX]);
    const currentY = interpolate(progress, [0, 1], [startY, endY]);
    const length = interpolate(progress, [0, 0.5, 1], [200, 120, 30]);
    const opacity = interpolate(progress, [0, 0.3, 0.8, 1], [0, 0.6, 0.8, 0.3]);

    const dx = endX - startX;
    const dy = endY - startY;
    const rotation = Math.atan2(dy, dx) * (180 / Math.PI);

    return { x: currentX, y: currentY, length, opacity, rotation };
  });

  return (
    <>
      {fibers.map((f, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: f.x,
            top: f.y,
            width: f.length,
            height: 2,
            transform: `translate(-50%, -50%) rotate(${f.rotation}deg)`,
            background: "linear-gradient(90deg, transparent, #22d3ee, #fff, #22d3ee, transparent)",
            opacity: f.opacity,
            boxShadow: "0 0 8px #22d3ee",
            borderRadius: 1,
          }}
        />
      ))}
    </>
  );
};

// Text slam with heavy spring physics
const TextSlam: React.FC<{
  text: string;
  delay: number;
  fontSize?: number;
}> = ({ text, delay, fontSize = 62 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - delay;
  if (localFrame < 0) return null;

  const slamProgress = spring({
    frame: localFrame,
    fps,
    config: { damping: 30, stiffness: 400, mass: 0.4 },
  });

  const scale = interpolate(slamProgress, [0, 1], [1.8, 1]);
  const opacity = interpolate(slamProgress, [0, 0.3, 1], [0, 1, 1]);

  // Flash on impact
  const flashOpacity = interpolate(localFrame, [0, 3, 8], [0, 0.6, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
      }}
    >
      {/* Impact flash */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 100,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, #22d3ee44 0%, transparent 70%)",
          opacity: flashOpacity,
        }}
      />
      <span
        style={{
          fontFamily,
          fontSize,
          fontWeight: 800,
          color: "#ffffff",
          letterSpacing: "-2px",
          transform: `scale(${scale})`,
          opacity,
          display: "inline-block",
          textShadow: "0 0 15px rgba(255,255,255,0.3)",
        }}
      >
        {text}
      </span>
    </div>
  );
};

// Typewriter HUD text
const HUDTypewriter: React.FC<{
  text: string;
  delay: number;
  speed?: number;
}> = ({ text, delay, speed = 2.5 }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - delay;
  if (localFrame < 0) return null;

  const charsToShow = Math.min(Math.floor(localFrame * speed), text.length);
  const displayText = text.slice(0, charsToShow);
  const showCursor = localFrame % 14 < 9 && charsToShow < text.length;

  return (
    <span
      style={{
        fontFamily: "monospace",
        fontSize: 13,
        letterSpacing: "2px",
        color: "#22d3ee",
        textTransform: "uppercase",
      }}
    >
      {displayText}
      {showCursor && (
        <span style={{ color: "#22d3ee", opacity: 0.7 }}>▌</span>
      )}
    </span>
  );
};

// Neon ring SVG
const NeonRing: React.FC<{
  progress: number;
  radius: number;
  rotating?: boolean;
}> = ({ progress, radius, rotating }) => {
  const frame = useCurrentFrame();
  const circumference = 2 * Math.PI * radius;
  const dashLength = circumference * progress;
  const rotation = rotating ? frame * 2 : 0;

  return (
    <svg
      width={radius * 2 + 20}
      height={radius * 2 + 20}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      }}
    >
      {/* Background ring */}
      <circle
        cx={radius + 10}
        cy={radius + 10}
        r={radius}
        fill="none"
        stroke="rgba(34, 211, 238, 0.08)"
        strokeWidth={3}
      />
      {/* Neon Glow Blur */}
      <circle
        cx={radius + 10}
        cy={radius + 10}
        r={radius}
        fill="none"
        stroke="rgba(34, 211, 238, 0.4)"
        strokeWidth={8}
        strokeDasharray={`${dashLength} ${circumference}`}
        strokeLinecap="round"
        opacity={0.6}
        filter="blur(4px)"
      />
      {/* Animated ring main */}
      <circle
        cx={radius + 10}
        cy={radius + 10}
        r={radius}
        fill="none"
        stroke="#22d3ee"
        strokeWidth={3}
        strokeDasharray={`${dashLength} ${circumference}`}
        strokeLinecap="round"
        opacity={0.9}
        filter="drop-shadow(0 0 6px rgba(34, 211, 238, 0.6))"
      />
      {/* Core bright line */}
      <circle
        cx={radius + 10}
        cy={radius + 10}
        r={radius}
        fill="none"
        stroke="#ffffff"
        strokeWidth={1}
        strokeDasharray={`${dashLength} ${circumference}`}
        strokeLinecap="round"
        opacity={0.8}
      />
    </svg>
  );
};

// Shockwave expanding ring
const Shockwave: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - delay;
  if (localFrame < 0) return null;

  const expandProgress = interpolate(localFrame, [0, fps * 0.8], [0, 1], {
    extrapolateRight: "clamp",
  });

  const scale = interpolate(expandProgress, [0, 1], [1, 4.5]);
  const opacity = interpolate(expandProgress, [0, 0.2, 1], [0.9, 0.4, 0]);
  const ringWidth = interpolate(expandProgress, [0, 1], [6, 1]);

  const scale2 = interpolate(expandProgress, [0, 1], [0.8, 3.5]);
  const opacity2 = interpolate(expandProgress, [0, 0.1, 1], [0, 0.6, 0]);

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${scale})`,
          width: 200,
          height: 200,
          borderRadius: "50%",
          border: `${ringWidth}px solid #22d3ee`,
          opacity,
          boxShadow: "0 0 30px #22d3ee, inset 0 0 20px #22d3ee44",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${scale2})`,
          width: 200,
          height: 200,
          borderRadius: "50%",
          border: `2px solid #ffffff`,
          opacity: opacity2,
          boxShadow: "0 0 10px #22d3ee",
          pointerEvents: "none",
        }}
      />
    </>
  );
};

// Explosion particles from center
const ExplosionParticles: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - delay;
  if (localFrame < 0) return null;

  const particles = Array.from({ length: 20 }, (_, i) => {
    const angle = (i / 20) * Math.PI * 2;
    const speed = 2 + (i % 5) * 1.5;
    const distance = localFrame * speed;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    const opacity = Math.max(0, 1 - localFrame / (fps * 1.2));
    const size = 2 + (i % 3);

    return { x, y, opacity, size };
  });

  return (
    <>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `calc(50% + ${p.x}px)`,
            top: `calc(50% + ${p.y}px)`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            backgroundColor: "#22d3ee",
            opacity: p.opacity,
            boxShadow: "0 0 4px #22d3ee",
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </>
  );
};

// Counting number with dramatic stop
const BigCounter: React.FC<{
  target: number;
  startFrame: number;
  duration: number;
}> = ({ target, startFrame, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - startFrame;
  if (localFrame < 0) return null;

  const countProgress = interpolate(localFrame, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Easing: fast then abrupt stop
  const eased = 1 - Math.pow(1 - countProgress, 3);
  const currentValue = Math.round(eased * target);

  // Glow intensifies as we approach target
  const glowIntensity = interpolate(countProgress, [0.8, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Scale bump on landing
  const landed = countProgress >= 1;
  const landBump = landed
    ? spring({
        frame: localFrame - duration,
        fps,
        config: { damping: 20, stiffness: 300, mass: 0.3 },
      })
    : 0;

  const scale = landed
    ? interpolate(landBump, [0, 1], [1.15, 1])
    : 1;

  return (
    <span
      style={{
        fontFamily,
        fontSize: 140,
        fontWeight: 900,
        color: "#22d3ee",
        letterSpacing: "-6px",
        display: "inline-block",
        transform: `scale(${scale})`,
        textShadow: `0 0 ${20 + glowIntensity * 40}px #22d3ee, 0 0 ${60 + glowIntensity * 80}px #22d3ee44`,
      }}
    >
      {currentValue}
    </span>
  );
};

// Scene 1: Zero Hardware + Under 5 Minutes
const AccessScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fiberProgress = interpolate(frame, [0, fps * 1.2], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Phase 1: ZERO HARDWARE (0-1.5s)
  const showPhase1 = frame < fps * 1.5;
  // Phase 2: UNDER 5 MINUTES (1.5-3s)
  const showPhase2 = frame >= fps * 1.5;

  // Horizontal sweep transition
  const sweepProgress = interpolate(
    frame,
    [fps * 1.4, fps * 1.6],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const phase1Opacity = interpolate(
    frame,
    [fps * 1.3, fps * 1.5],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill>
      <LightFibers progress={fiberProgress} />

      {/* Sweep line at transition */}
      {sweepProgress > 0 && sweepProgress < 1 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${sweepProgress * 110 - 5}%`,
            width: 3,
            background: "linear-gradient(180deg, transparent, #22d3ee, #fff, #22d3ee, transparent)",
            boxShadow: "0 0 20px #22d3ee",
            opacity: 0.8,
          }}
        />
      )}

      {/* Phase 1: ZERO HARDWARE */}
      {showPhase1 && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            opacity: phase1Opacity,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
            }}
          >
            <TextSlam text="ZERO HARDWARE." delay={Math.round(fps * 0.3)} />
            <div style={{ marginTop: 8 }}>
              <HUDTypewriter
                text="[deployment: browser-native]"
                delay={Math.round(fps * 0.6)}
                speed={3}
              />
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* Phase 2: UNDER 5 MINUTES */}
      {showPhase2 && (
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
              gap: 20,
            }}
          >
            <TextSlam text="UNDER 5 MINUTES." delay={Math.round(fps * 1.5)} fontSize={58} />
            <div style={{ marginTop: 8 }}>
              <HUDTypewriter
                text="[daily session — from home]"
                delay={Math.round(fps * 1.8)}
                speed={3}
              />
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// Scene 2: The convergence and clinical value
const ImpactScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Ring assembly (0-1.5s)
  const ringProgress = interpolate(frame, [0, fps * 1.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Counter (0.3s - 1.5s)
  const counterStart = Math.round(fps * 0.3);
  const counterDuration = Math.round(fps * 1.2);

  // Shockwave fires when counter hits 14
  const shockwaveDelay = counterStart + counterDuration;

  // "CLINICAL BIOMARKERS" text
  const labelDelay = shockwaveDelay + Math.round(fps * 0.3);
  const labelProgress = spring({
    frame: Math.max(0, frame - labelDelay),
    fps,
    config: { damping: 60, stiffness: 150, mass: 0.5 },
  });

  // Bottom badges
  const badgeDelay = shockwaveDelay + Math.round(fps * 0.8);
  const badgeProgress = spring({
    frame: Math.max(0, frame - badgeDelay),
    fps,
    config: { damping: 80, stiffness: 180, mass: 0.5 },
  });

  // Ambient particles after explosion
  const ambientParticles = Array.from({ length: 15 }, (_, i) => {
    const angle = (i / 15) * Math.PI * 2;
    const dist = 160 + Math.sin(frame * 0.02 + i * 2) * 30;
    const direction = i % 2 === 0 ? 1 : -1;
    const x = Math.cos(angle + frame * 0.015 * direction) * dist;
    const y = Math.sin(angle + frame * 0.015 * direction) * dist;
    const opacity = frame > shockwaveDelay + 10
      ? 0.15 + Math.sin(frame * 0.04 + i) * 0.1
      : 0;
    const size = 2 + (i % 3);
    return { x, y, opacity, size };
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Orbiting ambient particles */}
      {ambientParticles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `calc(50% + ${p.x}px)`,
            top: `calc(50% + ${p.y}px)`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            backgroundColor: "#22d3ee",
            opacity: p.opacity,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}

      {/* Neon ring */}
      <NeonRing progress={ringProgress} radius={120} rotating />

      {/* Second subtle outer ring */}
      <NeonRing progress={ringProgress * 0.7} radius={150} rotating={false} />

      {/* Counter */}
      <BigCounter
        target={14}
        startFrame={counterStart}
        duration={counterDuration}
      />

      {/* Shockwave */}
      <Shockwave delay={shockwaveDelay} />

      {/* Explosion particles */}
      <ExplosionParticles delay={shockwaveDelay} />

      {/* "CLINICAL BIOMARKERS" label */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, ${interpolate(labelProgress, [0, 1], [180, 150])}px)`,
          opacity: labelProgress,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            fontFamily,
            fontSize: 22,
            fontWeight: 600,
            color: "#e2e8f0",
            letterSpacing: "6px",
            textTransform: "uppercase",
          }}
        >
          CLINICAL BIOMARKERS
        </span>
        <span
          style={{
            fontFamily,
            fontSize: 15,
            fontWeight: 300,
            color: "#94a3b8",
            fontStyle: "italic",
          }}
        >
          extracted from a single webcam session
        </span>
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
          gap: 20,
        }}
      >
        {["BROWSER-NATIVE", "5 MIN SESSION", "ZERO HARDWARE"].map((label, i) => (
          <div
            key={label}
            style={{
              padding: "6px 14px",
              border: "1px solid #22d3ee33",
              borderRadius: 6,
              opacity: interpolate(
                badgeProgress,
                [0, 0.3 + i * 0.15, 0.5 + i * 0.15],
                [0, 0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              ),
            }}
          >
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 10,
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

export const Segment8DeploymentImpact: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Flash transition between scenes
  const flashStart = Math.round(fps * 3);
  const flashOpacity = interpolate(
    frame,
    [flashStart, flashStart + 3, flashStart + 8],
    [0, 0.7, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Fade out
  const fadeOut = interpolate(
    frame,
    [durationInFrames - fps * 0.4, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse at 50% 50%, #0a1525 0%, #040a12 50%, #020810 100%)",
        opacity: fadeOut,
      }}
    >
      <WarpSpeedGrid />

      {/* Scene 1: Access promises (0-3s) */}
      <Sequence from={0} durationInFrames={Math.round(fps * 3)}>
        <AccessScene />
      </Sequence>

      {/* Flash transition */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#22d3ee",
          opacity: flashOpacity,
          pointerEvents: "none",
          zIndex: 20,
        }}
      />

      {/* Scene 2: Impact convergence (3-8s) */}
      <Sequence from={Math.round(fps * 3)} durationInFrames={Math.round(fps * 5)}>
        <ImpactScene />
      </Sequence>
    </AbsoluteFill>
  );
};
