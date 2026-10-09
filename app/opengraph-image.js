import { ImageResponse } from "next/og";
import site from "@/content/site";
import home from "@/content/home";
import { brandUri, font, waveSvg } from "@/lib/brandImages";

export const alt = `${site.name}. ${home.hero.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const [bold, mark] = await Promise.all([font("IBMPlexSans-Bold.woff"), brandUri("wave-mark-on-dark.svg")]);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0B0B0B",
          padding: "64px 72px 72px",
          position: "relative",
        }}
      >
        <img src={waveSvg(size.width, size.height)} width={size.width} height={size.height} style={{ position: "absolute", left: 0, top: 0 }} />
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src={mark} width={64} height={45} />
          <div style={{ marginLeft: 18, fontFamily: "IBM Plex Sans", fontWeight: 700, fontSize: 38, color: "#FFFFFF", letterSpacing: "-0.01em" }}>{site.name}</div>
        </div>
        <div
          style={{
            display: "flex",
            maxWidth: 940,
            fontFamily: "IBM Plex Sans",
            fontWeight: 700,
            fontSize: 128,
            lineHeight: 1.04,
            letterSpacing: "-0.02em",
            color: "#FFFFFF",
          }}
        >
          {home.hero.title}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "IBM Plex Sans", data: bold, weight: 700, style: "normal" }],
    }
  );
}
