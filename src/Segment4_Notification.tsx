import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  staticFile,
} from "remotion";
import { fontFamily } from "./fonts";

const PhoneFrame: React.FC<{
  screenBrightness: number;
  children: React.ReactNode;
}> = ({ screenBrightness, children }) => {
  return (
    <div
      style={{
        position: "relative",
        width: 320,
        height: 640,
        borderRadius: 48,
        background: "linear-gradient(145deg, #1a1a1a 0%, #0a0a0a 50%, #1a1a1a 100%)",
        boxShadow: `
          0 0 0 2px #333,
          0 0 0 4px #111,
          0 20px 60px rgba(0,0,0,0.8),
          ${screenBrightness > 0.1 ? `0 0 ${40 * screenBrightness}px rgba(0,180,255,${0.15 * screenBrightness})` : "0 0 0 transparent"}
        `,
        padding: 12,
      }}
    >
      {/* Notch */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
          width: 100,
          height: 28,
          borderRadius: 14,
          backgroundColor: "#000",
          zIndex: 10,
        }}
      />

      {/* Screen */}
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 36,
          overflow: "hidden",
          position: "relative",
          backgroundColor: "#000",
        }}
      >
        {/* Screen content with brightness */}
        <div
          style={{
            width: "100%",
            height: "100%",
            opacity: screenBrightness,
            position: "relative",
          }}
        >
          {children}
        </div>
      </div>

      {/* Side button */}
      <div
        style={{
          position: "absolute",
          right: -3,
          top: 140,
          width: 3,
          height: 40,
          borderRadius: 2,
          backgroundColor: "#333",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -3,
          top: 120,
          width: 3,
          height: 28,
          borderRadius: 2,
          backgroundColor: "#333",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -3,
          top: 160,
          width: 3,
          height: 50,
          borderRadius: 2,
          backgroundColor: "#333",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -3,
          top: 220,
          width: 3,
          height: 50,
          borderRadius: 2,
          backgroundColor: "#333",
        }}
      />
    </div>
  );
};

const LockScreen: React.FC<{ brightness: number }> = ({ brightness }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 70,
      }}
    >
      {/* Time */}
      <p
        style={{
          fontFamily,
          fontSize: 56,
          fontWeight: 200,
          color: "white",
          margin: 0,
          letterSpacing: "-2px",
          opacity: brightness,
        }}
      >
        9:41
      </p>
      <p
        style={{
          fontFamily,
          fontSize: 14,
          fontWeight: 300,
          color: "#94a3b8",
          margin: "4px 0 0 0",
          opacity: brightness,
        }}
      >
        Wednesday, June 11
      </p>
    </AbsoluteFill>
  );
};

const PulseRing: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - delay;
  if (localFrame < 0) return null;

  const cycle = (localFrame % (fps * 1.5)) / (fps * 1.5);
  const scale = interpolate(cycle, [0, 1], [1, 2.5]);
  const opacity = interpolate(cycle, [0, 0.3, 1], [0.6, 0.3, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) scale(${scale})`,
        width: 320,
        height: 640,
        borderRadius: 48,
        border: "2px solid #00d4ff",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

export const Segment4Notification: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Phase 1 (0-1.5s): Phone dark, subtle ambient
  // Phase 2 (1.5-2.5s): Screen lights up
  // Phase 3 (2.5-4s): Notification slides down with bounce
  // Phase 4 (4-6s): Hold + text appears beside phone
  // Phase 5 (6-7s): fade out

  const screenOn = interpolate(frame, [fps * 1.5, fps * 2.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const notifSlide = spring({
    frame: Math.max(0, frame - Math.round(fps * 2.5)),
    fps,
    config: { damping: 12, stiffness: 150, mass: 0.6 },
  });

  const notifY = interpolate(notifSlide, [0, 1], [-120, 180]);
  const notifOpacity = interpolate(notifSlide, [0, 0.3, 1], [0, 1, 1]);

  const phoneScale = interpolate(frame, [fps * 1.5, fps * 2.5], [0.98, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const phoneBump = frame > fps * 2.5 && frame < fps * 2.8
    ? Math.sin((frame - fps * 2.5) * 0.8) * 2
    : 0;

  // Text beside phone
  const textDelay = Math.round(fps * 3.5);
  const textProgress = spring({
    frame: Math.max(0, frame - textDelay),
    fps,
    config: { damping: 80, stiffness: 180, mass: 0.5 },
  });

  // Subtitle
  const subDelay = Math.round(fps * 4.2);
  const subProgress = spring({
    frame: Math.max(0, frame - subDelay),
    fps,
    config: { damping: 80, stiffness: 180, mass: 0.5 },
  });

  // Bottom badge
  const badgeDelay = Math.round(fps * 5);
  const badgeProgress = spring({
    frame: Math.max(0, frame - badgeDelay),
    fps,
    config: { damping: 80, stiffness: 200, mass: 0.5 },
  });

  const fadeOut = interpolate(
    frame,
    [durationInFrames - fps * 0.5, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Ambient glow when screen turns on
  const ambientGlow = interpolate(frame, [fps * 2, fps * 3], [0, 0.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        opacity: fadeOut,
      }}
    >
      {/* Background ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "42%",
          transform: "translate(-50%, -50%)",
          width: 500,
          height: 700,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, #00d4ff08 0%, transparent 70%)",
          opacity: ambientGlow,
        }}
      />

      {/* Subtle horizontal line */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          height: 1,
          opacity: interpolate(frame, [fps * 2, fps * 3], [0, 0.15], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          background: "linear-gradient(90deg, transparent 10%, #00d4ff 50%, transparent 90%)",
        }}
      />

      {/* Phone + Notification */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "38%",
          transform: `translate(-50%, -50%) scale(${phoneScale}) translateY(${phoneBump}px)`,
        }}
      >
        <PulseRing delay={Math.round(fps * 2.5)} />

        <PhoneFrame screenBrightness={screenOn}>
          <LockScreen brightness={screenOn} />

          {/* Notification banner */}
          <div
            style={{
              position: "absolute",
              left: 12,
              right: 12,
              top: notifY,
              opacity: notifOpacity,
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
            }}
          >
            <Img
              src={staticFile("notificacion.png")}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
              }}
            />
          </div>
        </PhoneFrame>
      </div>

      {/* Right side text */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "62%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          maxWidth: 380,
        }}
      >
        {/* Main headline */}
        <div
          style={{
            opacity: textProgress,
            transform: `translateX(${interpolate(textProgress, [0, 1], [30, 0])}px)`,
          }}
        >
          <h2
            style={{
              fontFamily,
              fontSize: 40,
              fontWeight: 700,
              color: "white",
              margin: 0,
              lineHeight: 1.15,
              letterSpacing: "-1px",
            }}
          >
            Session done.
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #60a5fa, #22d3ee)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Report ready.
            </span>
          </h2>
        </div>

        {/* Subtitle */}
        <div
          style={{
            opacity: subProgress,
            transform: `translateX(${interpolate(subProgress, [0, 1], [20, 0])}px)`,
          }}
        >
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
            The patient played from home.
            <br />
            <span style={{ color: "#e2e8f0" }}>
              You get the results automatically.
            </span>
          </p>
        </div>

        {/* Badge */}
        <div
          style={{
            opacity: badgeProgress,
            transform: `translateY(${interpolate(badgeProgress, [0, 1], [10, 0])}px)`,
            marginTop: 8,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              background: "rgba(34,211,238,0.06)",
              border: "1px solid #22d3ee22",
              borderRadius: 8,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "#22d3ee",
                boxShadow: "0 0 6px #22d3ee",
              }}
            />
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 12,
                letterSpacing: "1.5px",
                color: "#22d3ee",
                textTransform: "uppercase",
              }}
            >
              zero clinician time spent
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
