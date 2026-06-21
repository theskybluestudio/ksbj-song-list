import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background: "linear-gradient(135deg, #0f172a 0%, #111827 45%, #3b0764 100%)",
          color: "#f8fafc",
          padding: "56px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            border: "1px solid rgba(244, 114, 182, 0.18)",
            borderRadius: "28px",
            padding: "44px",
            background: "rgba(15, 23, 42, 0.48)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.78)",
              }}
            >
              KSBJ Song History
            </div>
            <div
              style={{
                fontSize: 72,
                lineHeight: 1.05,
                fontWeight: 800,
                maxWidth: 900,
              }}
            >
              Recently played songs and full playlist
            </div>
            <div
              style={{
                fontSize: 30,
                lineHeight: 1.35,
                color: "rgba(241, 245, 249, 0.86)",
                maxWidth: 860,
              }}
            >
              Search the latest KSBJ songs, browse the most-played tracks, and open the YouTube Music playlist.
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                fontSize: 26,
                color: "rgba(255,255,255,0.74)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  background: "#38bdf8",
                }}
              />
              music.skybluestudio.net
            </div>
            <div
              style={{
                display: "flex",
                padding: "12px 20px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                fontSize: 24,
                color: "rgba(255,255,255,0.85)",
              }}
            >
              KSBJ.org ↗
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
