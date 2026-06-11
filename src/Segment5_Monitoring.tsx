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

const WEEKS = 6;
const DAYS_PER_WEEK = 7;
const TOTAL_DAYS = WEEKS * DAYS_PER_WEEK;
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

const CELL_WIDTH = 120;
const CELL_HEIGHT = 68;
const CELL_GAP = 6;
const GRID_LEFT = 115;
const GRID_TOP = 145;

const getCellPosition = (day: number) => {
  const week = Math.floor(day / DAYS_PER_WEEK);
  const dayOfWeek = day % DAYS_PER_WEEK;
  return {
    x: GRID_LEFT + dayOfWeek * (CELL_WIDTH + CELL_GAP),
    y: GRID_TOP + week * (CELL_HEIGHT + CELL_GAP),
  };
};

// Deterministic pseudo-random based on index
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// Mini bar chart inside a cell
const MiniBarChart: React.FC<{ seed: number; progress: number }> = ({
  seed,
  progress,
}) => {
  const bars = Array.from({ length: 5 }, (_, i) => {
    const height = 12 + seededRandom(seed * 10 + i) * 28;
    return height;
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 3,
        height: 32,
        opacity: progress,
        transform: `scaleY(${interpolate(progress, [0, 1], [0.3, 1])})`,
        transformOrigin: "bottom",
      }}
    >
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            width: 6,
            height: h * progress,
            borderRadius: 2,
            background:
              i === 3
                ? "linear-gradient(180deg, #22d3ee, #0891b2)"
                : "linear-gradient(180deg, #38bdf844, #0e7490aa)",
          }}
        />
      ))}
    </div>
  );
};

// Mini line sparkline inside a cell
const MiniSparkline: React.FC<{ seed: number; progress: number }> = ({
  seed,
  progress,
}) => {
  const points = Array.from({ length: 8 }, (_, i) => {
    const y = 16 + seededRandom(seed * 7 + i * 3) * 16;
    return { x: i * 12, y };
  });

  const visibleCount = Math.floor(points.length * progress);
  const pathD = points
    .slice(0, visibleCount)
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <svg
      width="84"
      height="32"
      style={{ opacity: progress }}
    >
      <path
        d={pathD}
        fill="none"
        stroke="#22d3ee"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {visibleCount > 0 && (
        <circle
          cx={points[visibleCount - 1].x}
          cy={points[visibleCount - 1].y}
          r={3}
          fill="#22d3ee"
          opacity={progress}
        />
      )}
    </svg>
  );
};

// Mini score badge inside a cell
const MiniScore: React.FC<{ seed: number; progress: number }> = ({
  seed,
  progress,
}) => {
  const score = Math.floor(60 + seededRandom(seed * 13) * 35);
  const isGood = score > 80;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        opacity: progress,
        transform: `scale(${interpolate(progress, [0, 1], [0.5, 1])})`,
      }}
    >
      <span
        style={{
          fontFamily,
          fontSize: 18,
          fontWeight: 700,
          color: isGood ? "#22d3ee" : "#38bdf8",
          textShadow: isGood ? "0 0 8px #22d3ee44" : "none",
        }}
      >
        {score}
      </span>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: 7,
          letterSpacing: "0.5px",
          color: "#64748b",
          textTransform: "uppercase",
        }}
      >
        CRI
      </span>
    </div>
  );
};

// Mini dot cluster (activity indicator)
const MiniDots: React.FC<{ seed: number; progress: number }> = ({
  seed,
  progress,
}) => {
  const dots = Array.from({ length: 9 }, (_, i) => {
    const active = seededRandom(seed * 5 + i) > 0.3;
    const intensity = 0.3 + seededRandom(seed * 11 + i) * 0.7;
    return { active, intensity };
  });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 10px)",
        gap: 4,
        opacity: progress,
        transform: `scale(${interpolate(progress, [0, 1], [0.6, 1])})`,
      }}
    >
      {dots.map((d, i) => (
        <div
          key={i}
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: d.active
              ? `rgba(34, 211, 238, ${d.intensity * progress})`
              : "rgba(100, 116, 139, 0.2)",
            boxShadow: d.active
              ? `0 0 4px rgba(34, 211, 238, ${0.3 * progress})`
              : "none",
          }}
        />
      ))}
    </div>
  );
};

const CellVisualization: React.FC<{
  day: number;
  progress: number;
}> = ({ day, progress }) => {
  const type = day % 4;
  switch (type) {
    case 0:
      return <MiniBarChart seed={day} progress={progress} />;
    case 1:
      return <MiniSparkline seed={day} progress={progress} />;
    case 2:
      return <MiniScore seed={day} progress={progress} />;
    case 3:
      return <MiniDots seed={day} progress={progress} />;
    default:
      return null;
  }
};

// Single calendar cell
const CalendarCell: React.FC<{
  day: number;
  isEmpty: boolean;
  fillProgress: number;
  emptyPulse: number;
  isAppointment?: boolean;
}> = ({ day, isEmpty, fillProgress, emptyPulse, isAppointment }) => {
  const pos = getCellPosition(day);
  const dayNumber = day + 1;

  const bgEmpty = isAppointment
    ? "rgba(34, 211, 238, 0.08)"
    : `rgba(239, 68, 68, ${0.02 + emptyPulse * 0.03})`;

  const borderEmpty = isAppointment
    ? "rgba(34, 211, 238, 0.3)"
    : `rgba(239, 68, 68, ${0.1 + emptyPulse * 0.08})`;

  const bgFilled = `rgba(34, 211, 238, ${0.04 + fillProgress * 0.08})`;
  const borderFilled = `rgba(34, 211, 238, ${0.15 + fillProgress * 0.35})`;

  const bg = isEmpty ? bgEmpty : bgFilled;
  const border = isEmpty ? borderEmpty : borderFilled;

  return (
    <div
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        width: CELL_WIDTH,
        height: CELL_HEIGHT,
        borderRadius: 8,
        backgroundColor: bg,
        border: `1px solid ${border}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        transition: "all 0.3s",
        boxShadow: !isEmpty && fillProgress > 0.5
          ? `0 0 12px rgba(34, 211, 238, ${fillProgress * 0.15}), inset 0 0 8px rgba(34, 211, 238, ${fillProgress * 0.05})`
          : "none",
      }}
    >
      {/* Day number - top left */}
      <span
        style={{
          position: "absolute",
          top: 4,
          left: 7,
          fontFamily: "monospace",
          fontSize: 8,
          color: isEmpty ? "#475569" : `rgba(148, 163, 184, ${0.5 + fillProgress * 0.5})`,
          letterSpacing: "0.5px",
        }}
      >
        {dayNumber}
      </span>

      {/* Content */}
      {isEmpty && !isAppointment && (
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 10,
            color: `rgba(239, 68, 68, ${0.2 + emptyPulse * 0.15})`,
            letterSpacing: "1px",
          }}
        >
          NO DATA
        </span>
      )}

      {isEmpty && isAppointment && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#22d3ee",
              boxShadow: "0 0 6px #22d3ee",
            }}
          />
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 7,
              color: "#22d3ee",
              letterSpacing: "0.5px",
            }}
          >
            VISIT
          </span>
        </div>
      )}

      {!isEmpty && (
        <CellVisualization day={day} progress={fillProgress} />
      )}
    </div>
  );
};

// Floating particles for ambient effect
const AmbientParticles: React.FC<{ color: string; count: number; speed: number }> = ({
  color,
  count,
  speed,
}) => {
  const frame = useCurrentFrame();
  const particles = Array.from({ length: count }, (_, i) => {
    const x = (i * 41 + frame * speed * 0.08 * (i % 3 + 1)) % 110 - 5;
    const y = (i * 59 + frame * speed * 0.04 * (i % 4 + 1)) % 110 - 5;
    const opacity = 0.08 + Math.sin(frame * 0.02 + i * 2) * 0.06;
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
            backgroundColor: color,
            opacity: p.opacity,
          }}
        />
      ))}
    </>
  );
};

// Week labels on the left side
const WeekLabels: React.FC<{ opacity: number }> = ({ opacity }) => {
  return (
    <>
      {Array.from({ length: WEEKS }, (_, i) => {
        const pos = getCellPosition(i * DAYS_PER_WEEK);
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              left: GRID_LEFT - 55,
              top: pos.y + CELL_HEIGHT / 2 - 6,
              fontFamily: "monospace",
              fontSize: 9,
              color: "#475569",
              letterSpacing: "1px",
              opacity,
            }}
          >
            WK{i + 1}
          </span>
        );
      })}
    </>
  );
};

// Day headers (M T W T F S S)
const DayHeaders: React.FC<{ opacity: number }> = ({ opacity }) => {
  return (
    <>
      {DAY_LABELS.map((label, i) => {
        const x = GRID_LEFT + i * (CELL_WIDTH + CELL_GAP) + CELL_WIDTH / 2;
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              left: x - 5,
              top: GRID_TOP - 25,
              fontFamily: "monospace",
              fontSize: 10,
              color: "#64748b",
              letterSpacing: "1px",
              opacity,
            }}
          >
            {label}
          </span>
        );
      })}
    </>
  );
};

// Counter component
const DataCounter: React.FC<{
  value: number;
  label: string;
  color: string;
  glowColor: string;
  x: number;
  y: number;
  opacity: number;
}> = ({ value, label, color, glowColor, x, y, opacity }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        opacity,
      }}
    >
      <span
        style={{
          fontFamily,
          fontSize: 52,
          fontWeight: 800,
          color,
          textShadow: `0 0 20px ${glowColor}`,
          letterSpacing: "-2px",
        }}
      >
        {Math.floor(value)}
      </span>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          letterSpacing: "2px",
          color: `${color}88`,
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
};

// Connection line from filled cell to center
const DataFlowLine: React.FC<{
  fromDay: number;
  progress: number;
  delay: number;
}> = ({ fromDay, progress, delay }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - delay;
  if (localFrame < 0 || progress < 0.5) return null;

  const pos = getCellPosition(fromDay);
  const startX = pos.x + CELL_WIDTH / 2;
  const startY = pos.y + CELL_HEIGHT / 2;

  const pulse = Math.sin(localFrame * 0.1 + fromDay) * 0.3 + 0.5;
  const opacity = pulse * interpolate(progress, [0.5, 1], [0, 0.15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: startX,
        top: startY,
        width: 3,
        height: 3,
        borderRadius: "50%",
        backgroundColor: "#22d3ee",
        opacity,
        boxShadow: "0 0 4px #22d3ee",
      }}
    />
  );
};

// ===================== SCENES =====================

const EmptyCalendarScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Staggered cell appearance
  const gridAppear = interpolate(frame, [0, fps * 1.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Pulsing empty cells (subtle red throb)
  const emptyPulse = Math.sin(frame * 0.06) * 0.5 + 0.5;

  // Header text
  const headerProgress = interpolate(frame, [fps * 0.2, fps * 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Counter
  const counterStart = fps * 1.5;
  const counterValue = interpolate(frame, [counterStart, counterStart + fps * 2], [0, 40], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const counterOpacity = interpolate(frame, [counterStart, counterStart + fps * 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Red vignette intensity
  const vignetteProgress = interpolate(frame, [fps * 1, fps * 4], [0, 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Appointments on day 0 and day 41 (first and last)
  const appointmentDays = [0, 41];

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse at 50% 50%, #0a0a0f 0%, #050508 100%)",
      }}
    >
      {/* Red vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 30%, #e6394612 70%, #e6394620 100%)",
          opacity: vignetteProgress,
        }}
      />

      <AmbientParticles color="#e63946" count={20} speed={0.5} />

      {/* Header badge */}
      <div
        style={{
          position: "absolute",
          top: 35,
          left: "50%",
          transform: "translateX(-50%)",
          opacity: headerProgress,
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
            opacity: 0.6 + emptyPulse * 0.4,
          }}
        />
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            letterSpacing: "3px",
            color: "#e63946",
            textTransform: "uppercase",
          }}
        >
          monitoring — offline — no continuous data
        </span>
      </div>

      {/* Day headers */}
      <DayHeaders opacity={gridAppear} />

      {/* Week labels */}
      <WeekLabels opacity={gridAppear} />

      {/* Calendar grid - empty */}
      {Array.from({ length: TOTAL_DAYS }, (_, day) => {
        const cellDelay = day * 0.6;
        const cellOpacity = interpolate(
          frame,
          [cellDelay, cellDelay + fps * 0.4],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        return (
          <div key={day} style={{ opacity: cellOpacity }}>
            <CalendarCell
              day={day}
              isEmpty={true}
              fillProgress={0}
              emptyPulse={emptyPulse}
              isAppointment={appointmentDays.includes(day)}
            />
          </div>
        );
      })}

      {/* Counter - days without data */}
      <DataCounter
        value={counterValue}
        label="days without data"
        color="#e63946"
        glowColor="#e6394644"
        x={990}
        y={520}
        opacity={counterOpacity}
      />

      {/* Statement */}
      <SlideInText delay={Math.round(fps * 2)} direction="up" style={{ position: "absolute", bottom: 55, left: GRID_LEFT }}>
        <p
          style={{
            fontFamily,
            fontSize: 20,
            fontWeight: 300,
            color: "#64748b",
            margin: 0,
            fontStyle: "italic",
          }}
        >
          6 weeks of recovery.{" "}
          <span style={{ color: "#e63946", fontWeight: 500 }}>
            2 data points.
          </span>
        </p>
      </SlideInText>

      {/* Sub-statement */}
      <SlideInText delay={Math.round(fps * 3)} direction="up" style={{ position: "absolute", bottom: 25, left: GRID_LEFT }}>
        <TypewriterText
          text="[blind spot — no signal — no early warning — no trend]"
          startFrame={Math.round(fps * 3.1)}
          speed={2}
          style={{ fontSize: 10, color: "#e6394644" }}
        />
      </SlideInText>
    </AbsoluteFill>
  );
};

const TransitionFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const flashOpacity = interpolate(
    frame,
    [0, fps * 0.08, fps * 0.2, fps * 0.5],
    [0, 0.9, 0.6, 0],
    { extrapolateRight: "clamp" }
  );

  // Grid sweep line
  const sweepX = interpolate(frame, [0, fps * 0.5], [-5, 105], {
    extrapolateRight: "clamp",
  });

  // Expanding ring
  const ringScale = interpolate(frame, [fps * 0.05, fps * 0.4], [0, 3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ringOpacity = interpolate(frame, [fps * 0.05, fps * 0.4], [0.8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {/* Flash overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#22d3ee",
          opacity: flashOpacity * 0.4,
        }}
      />

      {/* Sweep line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${sweepX}%`,
          width: 4,
          background: "linear-gradient(180deg, transparent, #22d3ee, #fff, #22d3ee, transparent)",
          boxShadow: "0 0 30px #22d3ee, 0 0 60px #22d3ee66",
          opacity: interpolate(frame, [0, fps * 0.1, fps * 0.4, fps * 0.5], [0, 1, 1, 0], {
            extrapolateRight: "clamp",
          }),
        }}
      />

      {/* Expanding ring from center */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${ringScale})`,
          width: 200,
          height: 200,
          borderRadius: "50%",
          border: "3px solid #22d3ee",
          opacity: ringOpacity,
        }}
      />
    </AbsoluteFill>
  );
};

const FullCalendarScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Staggered fill: cells fill one by one in a wave pattern
  const fillWaveDuration = fps * 2.5;
  const fillStartFrame = fps * 0.3;

  // Header
  const headerProgress = interpolate(frame, [0, fps * 0.4], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Overall grid brightness boost
  const gridGlow = interpolate(frame, [fillStartFrame, fillStartFrame + fillWaveDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Counter
  const counterStart = fps * 1;
  const counterValue = interpolate(frame, [counterStart, counterStart + fps * 2.5], [0, 42], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const counterOpacity = interpolate(frame, [counterStart, counterStart + fps * 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Bottom badges
  const badgeDelay = fps * 3.5;
  const badgeProgress = spring({
    frame: Math.max(0, frame - badgeDelay),
    fps,
    config: { damping: 80, stiffness: 180, mass: 0.5 },
  });

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse at 50% 50%, #0a1525 0%, #060e1a 50%, #030508 100%)",
      }}
    >
      {/* Blue ambient glow behind grid */}
      <div
        style={{
          position: "absolute",
          top: "45%",
          left: "45%",
          transform: "translate(-50%, -50%)",
          width: 900,
          height: 500,
          borderRadius: "40%",
          background: "radial-gradient(ellipse, #22d3ee06 0%, transparent 70%)",
          opacity: gridGlow,
        }}
      />

      <AmbientParticles color="#22d3ee" count={25} speed={1} />

      {/* Header badge */}
      <div
        style={{
          position: "absolute",
          top: 35,
          left: "50%",
          transform: "translateX(-50%)",
          opacity: headerProgress,
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
            fontSize: 11,
            letterSpacing: "3px",
            color: "#22d3ee",
            textTransform: "uppercase",
          }}
        >
          monitoring — online — every session captured
        </span>
      </div>

      {/* Day headers */}
      <DayHeaders opacity={headerProgress} />

      {/* Week labels */}
      <WeekLabels opacity={headerProgress} />

      {/* Calendar grid - filling */}
      {Array.from({ length: TOTAL_DAYS }, (_, day) => {
        // Diagonal wave fill pattern
        const week = Math.floor(day / DAYS_PER_WEEK);
        const dayOfWeek = day % DAYS_PER_WEEK;
        const waveIndex = week + dayOfWeek * 0.7;
        const maxWaveIndex = WEEKS + DAYS_PER_WEEK * 0.7;
        const normalizedWave = waveIndex / maxWaveIndex;

        const cellFillStart = fillStartFrame + normalizedWave * fillWaveDuration * 0.7;
        const cellFillEnd = cellFillStart + fps * 0.6;

        const fillProgress = interpolate(
          frame,
          [cellFillStart, cellFillEnd],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        return (
          <React.Fragment key={day}>
            <CalendarCell
              day={day}
              isEmpty={false}
              fillProgress={fillProgress}
              emptyPulse={0}
            />
            <DataFlowLine
              fromDay={day}
              progress={fillProgress}
              delay={Math.round(cellFillStart)}
            />
          </React.Fragment>
        );
      })}

      {/* Counter - days with data */}
      <DataCounter
        value={counterValue}
        label="days with data"
        color="#22d3ee"
        glowColor="#22d3ee44"
        x={990}
        y={520}
        opacity={counterOpacity}
      />

      {/* Statement */}
      <SlideInText delay={Math.round(fps * 3)} direction="up" style={{ position: "absolute", bottom: 75, left: GRID_LEFT }}>
        <p
          style={{
            fontFamily,
            fontSize: 20,
            fontWeight: 300,
            color: "#94a3b8",
            margin: 0,
          }}
        >
          Same 6 weeks.{" "}
          <span
            style={{
              fontWeight: 600,
              background: "linear-gradient(135deg, #22d3ee, #38bdf8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            42 data points.
          </span>
        </p>
      </SlideInText>

      {/* Bottom badges */}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          left: GRID_LEFT,
          opacity: badgeProgress,
          display: "flex",
          gap: 16,
        }}
      >
        {["CONTINUOUS", "OBJECTIVE", "AUTOMATIC", "DAILY"].map((label, i) => (
          <div
            key={label}
            style={{
              padding: "5px 12px",
              border: "1px solid #22d3ee33",
              borderRadius: 5,
              opacity: interpolate(
                badgeProgress,
                [0, 0.4 + i * 0.12, 0.6 + i * 0.12],
                [0, 0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              ),
            }}
          >
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 9,
                letterSpacing: "1.5px",
                color: "#22d3ee",
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Sub footer */}
      <SlideInText delay={Math.round(fps * 4)} direction="up" style={{ position: "absolute", bottom: 8, left: GRID_LEFT }}>
        <TypewriterText
          text="[every metric — every trend — every early warning — captured]"
          startFrame={Math.round(fps * 4.1)}
          speed={2}
          style={{ fontSize: 9, color: "#22d3ee44" }}
        />
      </SlideInText>
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
      {/* Scene 1: Empty calendar - The Problem (0–5s) */}
      <Sequence from={0} durationInFrames={Math.round(fps * 5)}>
        <EmptyCalendarScene />
      </Sequence>

      {/* Transition flash (5s–5.5s) */}
      <Sequence from={Math.round(fps * 5)} durationInFrames={Math.round(fps * 0.5)}>
        <TransitionFlash />
      </Sequence>

      {/* Scene 2: Full calendar - The Solution (5.2s–11s) */}
      <Sequence from={Math.round(fps * 5.2)} durationInFrames={Math.round(fps * 5.8)}>
        <FullCalendarScene />
      </Sequence>
    </AbsoluteFill>
  );
};
