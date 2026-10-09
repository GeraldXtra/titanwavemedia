import { ImageResponse } from "next/og";
import site from "@/content/site";
import { brandUri, font } from "@/lib/brandImages";

export const dynamic = "force-static";

export async function GET() {
  const [bold, mark] = await Promise.all([font("IBMPlexSans-Bold.woff"), brandUri("wave-mark.svg")]);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", background: "#FFFFFF" }}>
        <img src={mark} width={80} height={56} />
        <div style={{ marginLeft: 18, fontFamily: "IBM Plex Sans", fontWeight: 700, fontSize: 36, color: "#0B0B0B" }}>{site.name}</div>
      </div>
    ),
    { width: 440, height: 72, fonts: [{ name: "IBM Plex Sans", data: bold, weight: 700, style: "normal" }] }
  );
}
