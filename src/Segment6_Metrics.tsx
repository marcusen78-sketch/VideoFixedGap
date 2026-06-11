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

interface MetricData {
  label: string;
  value: number;
  startValue: number;
  unit: string;
  decimals: number;
  maxValue: number;
  game: string;
}

const METRICS: MetricData[] = [
  { label: "REACTION TIME", value: 187, startValue: 203, unit: "ms", decimals: 0, maxValue: 300, game: "SWITCHES" },
  { label: "PINCH PRECISION", value: 0.8, startValue: 1.4, unit: "mm", decimals: 1, maxValue: 3, game: "PILLBOX" },
  { label: "TREMOR INDEX", value: 72, startValue: 65, unit: "% stable", decimals: 0, maxValue: 100, game: "WATER JUG" },
  { label: "WRIST ROTATION", value: 156, startValue: 141, unit: "°", decimals: 0, maxValue: 180, game: "WATER JUG" },
  { label: "BIMANUAL SYNC", value: 94, startValue: 88, unit: "%", decimals: 0, maxValue: 100, game: "SWITCHES" },
  { label: "TASK EFFICIENCY", value: 87, startValue: 81, unit: "% acc", decimals: 0, maxValue: 100, game: "PILLBOX" },
];

const GRID_COLS = 3;
const CARD_WIDTH = 340;
const CARD_HEIGHT = 210;
const CARD_GAP_X = 40;
const CARD_GAP_Y = 35;

const getCardPosition = (index: number) => {
  const col = index % GRID_COLS;
  const row = Math.floor(index / GRID_COLS);
  const totalWidth = GRID_COLS * CARD_WIDTH + (GRID_COLS - 1) * CARD_GAP_X;
  const totalHeight = 2 * CARD_HEIGHT + CARD_GAP_Y;
  const startX = (1280 - totalWidth) / 2;
  const startY = (714 - totalHeight) / 2 + 15;
  return {
    x: startX + col * (CARD_WIDTH + CARD_GAP_X),
    y: startY + row * (CARD_HEIGHT + CARD_GAP_Y),
  };
};

// Animated arc (SVG semicircle fill)
const MetricArc: React.FC<{
  progress: number;
  fillRatio: number;
  size: number;
}> = ({ progress, fillRatio, size }) => {
  const frame = useCurrentFrame();
  const radius = size / 2 - 6;
  const centerX = size / 2;
  const centerY = size / 2 + 4;
  const startAngle = -180;
  const endAngle = startAngle + 180 * fillRatio * progress;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const x1 = centerX + radius * Math.cos(toRad(startAngle));
  const y1 = centerY + radius * Math.sin(toRad(startAngle));
  const x2 = centerX + radius * Math.cos(toRad(endAngle));
  const y2 = centerY + radius * Math.sin(toRad(endAngle));

  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;

  const arcPath = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  const bgPath = `M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`;

  // Subtle pulse when fully loaded
  const pulse = progress > 0.95 ? Math.sin(frame * 0.08) * 0.15 + 0.85 : 1;

  return (
    <svg width={size} height={size / 2 + 12} style={{ overflow: "visible" }}>
      {/* Background track */}
      <path
        d={bgPath}
        fill="none"
        stroke="rgba(100, 116, 139, 0.15)"
        strokeWidth={4}
        strokeLinecap="round"
      />
      {/* Filled arc */}
      <path
        d={arcPath}
        fill="none"
        stroke={fillRatio > 0.7 ? "#22d3ee" : "#38bdf8"}
        strokeWidth={4}
        strokeLinecap="round"
        opacity={progress * pulse}
        filter={progress > 0.9 ? "drop-shadow(0 0 4px rgba(34, 211, 238, 0.4))" : "none"}
      />
      {/* Glow on the end point */}
      {progress > 0.3 && (
        <circle
          cx={x2}
          cy={y2}
          r={3}
          fill="#22d3ee"
          opacity={progress * 0.8}
          filter="drop-shadow(0 0 3px rgba(34, 211, 238, 0.6))"
        />
      )}
    </svg>
  );
};

// Typing text animation
const TypingText: React.FC<{
  text: string;
  startFrame: number;
  speed?: number;
  style?: React.CSSProperties;
}> = ({ text, startFrame, speed = 2, style }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  if (localFrame < 0) return null;

  const charsToShow = Math.min(Math.floor(localFrame * speed), text.length);
  const displayText = text.slice(0, charsToShow);
  const showCursor = localFrame % 14 < 9 && charsToShow < text.length;

  return (
    <span style={style}>
      {displayText}
      {showCursor && (
        <span style={{ color: "#22d3ee", opacity: 0.7 }}>▌</span>
      )}
    </span>
  );
};

// Animated number that counts from startValue to endValue
const CountingNumber: React.FC<{
  startValue: number;
  endValue: number;
  decimals: number;
  unit: string;
  progress: number;
}> = ({ startValue, endValue, decimals, unit, progress }) => {
  const current = interpolate(progress, [0, 1], [startValue, endValue]);
  const displayValue = decimals > 0 ? current.toFixed(decimals) : Math.round(current).toString();

  return (
    <span
      style={{
        fontFamily,
        fontSize: 44,
        fontWeight: 800,
        letterSpacing: "-2px",
        background: "linear-gradient(135deg, #22d3ee, #38bdf8, #60a5fa)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        display: "inline-block",
      }}
    >
      {displayValue}
      <span
        style={{
          fontSize: 18,
          fontWeight: 400,
          letterSpacing: "0px",
          background: "linear-gradient(135deg, #64748b, #94a3b8)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {unit}
      </span>
    </span>
  );
};

// Animated border draw effect
const AnimatedBorder: React.FC<{
  width: number;
  height: number;
  progress: number;
  children: React.ReactNode;
}> = ({ width, height, progress, children }) => {
  const frame = useCurrentFrame();
  const perimeter = 2 * (width + height);
  const dashLength = perimeter * progress;
  const gapLength = perimeter;

  // Subtle glow after fully drawn
  const glowOpacity = progress > 0.9
    ? 0.1 + Math.sin(frame * 0.05) * 0.05
    : 0;

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
      }}
    >
      {/* SVG border */}
      <svg
        width={width}
        height={height}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
        }}
      >
        {/* Background border (dim) */}
        <rect
          x={1}
          y={1}
          width={width - 2}
          height={height - 2}
          rx={12}
          ry={12}
          fill="none"
          stroke="rgba(100, 116, 139, 0.1)"
          strokeWidth={1}
        />
        {/* Animated border */}
        <rect
          x={1}
          y={1}
          width={width - 2}
          height={height - 2}
          rx={12}
          ry={12}
          fill="none"
          stroke="rgba(34, 211, 238, 0.5)"
          strokeWidth={1.5}
          strokeDasharray={`${dashLength} ${gapLength}`}
          strokeLinecap="round"
        />
      </svg>

      {/* Background fill */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 12,
          backgroundColor: `rgba(34, 211, 238, ${0.02 * progress})`,
          boxShadow: glowOpacity > 0
            ? `0 0 20px rgba(34, 211, 238, ${glowOpacity}), inset 0 0 15px rgba(34, 211, 238, ${glowOpacity * 0.5})`
            : "none",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          padding: 16,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Single metric card
const MetricCard: React.FC<{
  metric: MetricData;
  index: number;
  globalDelay: number;
}> = ({ metric, index, globalDelay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pos = getCardPosition(index);

  const localFrame = frame - globalDelay;
  if (localFrame < 0) return null;

  // Phase 1: Border draws (0 - 0.5s)
  const borderProgress = interpolate(localFrame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 2: Label types (0.2s - 0.7s)
  const labelStart = Math.round(fps * 0.2);

  // Phase 3: Number counts (0.4s - 1.2s)
  const numberProgress = interpolate(
    localFrame,
    [fps * 0.4, fps * 1.2],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Phase 4: Arc fills (0.5s - 1.3s)
  const arcProgress = interpolate(
    localFrame,
    [fps * 0.5, fps * 1.3],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Phase 5: Game tag appears (0.9s - 1.1s)
  const tagProgress = interpolate(
    localFrame,
    [fps * 0.9, fps * 1.1],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Entry animation
  const entryScale = spring({
    frame: localFrame,
    fps,
    config: { damping: 80, stiffness: 200, mass: 0.5 },
  });

  const fillRatio = metric.value / metric.maxValue;

  return (
    <div
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        transform: `scale(${entryScale})`,
        opacity: entryScale,
      }}
    >
      <AnimatedBorder
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        progress={borderProgress}
      >
        {/* Game origin tag - top right */}
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 14,
            opacity: tagProgress,
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 8,
              letterSpacing: "1px",
              color: "#4a9eff66",
              textTransform: "uppercase",
            }}
          >
            {metric.game}
          </span>
        </div>

        {/* Label with typing effect */}
        <div style={{ marginBottom: 4 }}>
          <TypingText
            text={metric.label}
            startFrame={globalDelay + labelStart}
            speed={2.5}
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              letterSpacing: "2px",
              color: "#94a3b8",
            }}
          />
        </div>

        {/* Big number */}
        <CountingNumber
          startValue={metric.startValue}
          endValue={metric.value}
          decimals={metric.decimals}
          unit={metric.unit}
          progress={numberProgress}
        />

        {/* Arc visualization */}
        <MetricArc
          progress={arcProgress}
          fillRatio={fillRatio}
          size={100}
        />
      </AnimatedBorder>
    </div>
  );
};

// Ambient floating particles
const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  const particles = Array.from({ length: 25 }, (_, i) => {
    const x = (i * 43 + frame * 0.06 * (i % 3 + 1)) % 105 - 2;
    const y = (i * 61 + frame * 0.035 * (i % 4 + 1)) % 105 - 2;
    const opacity = 0.06 + Math.sin(frame * 0.025 + i * 1.7) * 0.04;
    const size = 1 + (i % 2);
    return { x, y, opacity, size };
  });

  return (
    <>
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
    </>
  );
};

// Connection lines between cards (subtle)
const ConnectionLines: React.FC<{ progress: number }> = ({ progress }) => {
  if (progress < 0.3) return null;

  const opacity = interpolate(progress, [0.3, 0.8], [0, 0.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

  for (let i = 0; i < METRICS.length - 1; i++) {
    const pos1 = getCardPosition(i);
    const pos2 = getCardPosition(i + 1);
    lines.push({
      x1: pos1.x + CARD_WIDTH / 2,
      y1: pos1.y + CARD_HEIGHT / 2,
      x2: pos2.x + CARD_WIDTH / 2,
      y2: pos2.y + CARD_HEIGHT / 2,
    });
  }

  return (
    <svg
      width="1280"
      height="714"
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
    >
      {lines.map((line, i) => (
        <line
          key={i}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="#22d3ee"
          strokeWidth={1}
          opacity={opacity}
          strokeDasharray="4 8"
        />
      ))}
    </svg>
  );
};

export const Segment6Metrics: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Header typing
  const headerStart = Math.round(fps * 0.3);

  // Card stagger: diagonal pattern
  const getCardDelay = (index: number) => {
    const col = index % GRID_COLS;
    const row = Math.floor(index / GRID_COLS);
    const diagIndex = row + col * 0.6;
    return Math.round(fps * 1.2 + diagIndex * fps * 0.5);
  };

  // Statement text
  const statementDelay = fps * 4.5;
  const statementProgress = spring({
    frame: Math.max(0, frame - statementDelay),
    fps,
    config: { damping: 80, stiffness: 150, mass: 0.6 },
  });

  // Footer badges
  const badgeDelay = fps * 5.5;
  const badgeProgress = spring({
    frame: Math.max(0, frame - badgeDelay),
    fps,
    config: { damping: 80, stiffness: 180, mass: 0.5 },
  });

  // Connection lines progress
  const connectProgress = interpolate(frame, [fps * 3, fps * 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
        background: "radial-gradient(ellipse at 50% 50%, #0a1525 0%, #060e1a 50%, #030508 100%)",
        opacity: fadeOut,
      }}
    >
      <Particles />

      {/* Ambient glow behind cards */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          height: 500,
          borderRadius: "40%",
          background: "radial-gradient(ellipse, #22d3ee05 0%, transparent 70%)",
        }}
      />

      {/* Header badge with typing */}
      <div
        style={{
          position: "absolute",
          top: 35,
          left: "50%",
          transform: "translateX(-50%)",
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
            opacity: frame > headerStart ? 1 : 0,
          }}
        />
        <TypingText
          text="CV PIPELINE — WEBCAM ONLY — REAL-TIME CAPTURE"
          startFrame={headerStart}
          speed={1.8}
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            letterSpacing: "2.5px",
            color: "#22d3ee",
          }}
        />
      </div>

      {/* Connection lines */}
      <ConnectionLines progress={connectProgress} />

      {/* Metric cards */}
      {METRICS.map((metric, i) => (
        <MetricCard
          key={i}
          metric={metric}
          index={i}
          globalDelay={getCardDelay(i)}
        />
      ))}

      {/* Statement text */}
      <div
        style={{
          position: "absolute",
          bottom: 70,
          left: "50%",
          transform: "translateX(-50%)",
          opacity: statementProgress,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <p
          style={{
            fontFamily,
            fontSize: 22,
            fontWeight: 300,
            color: "#94a3b8",
            margin: 0,
            fontStyle: "italic",
            textAlign: "center",
          }}
        >
          Objective data.{" "}
          <span
            style={{
              fontWeight: 600,
              color: "#e2e8f0",
            }}
          >
            Not "how are you feeling?"
          </span>
        </p>
      </div>

      {/* Footer badges */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          left: "50%",
          transform: "translateX(-50%)",
          opacity: badgeProgress,
          display: "flex",
          gap: 20,
        }}
      >
        {["NO HARDWARE", "NO SDK", "JUST A CAMERA"].map((label, i) => (
          <div
            key={label}
            style={{
              padding: "5px 14px",
              border: "1px solid #22d3ee33",
              borderRadius: 5,
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
                letterSpacing: "1.5px",
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
