import { ImageResponse } from "next/og";
import site from "@/content/site";
import { brandUri, font } from "@/lib/brandImages";

// The logo at the top of every email: the wave mark and the company name on white, as a PNG
// (email apps do not show SVG). Drawn at twice the size it is shown, for sharp screens.
export const dynamic = "force-static";

export async function GET() {
  const [bold, mark] = await Promise.all([font("OpenSans-Bold.ttf"), brandUri("wave-mark.svg")]);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", background: "#FFFFFF" }}>
        <img src={mark} width={80} height={56} />
        <div style={{ marginLeft: 18, fontFamily: "Open Sans", fontWeight: 700, fontSize: 36, color: "#0B0B0B" }}>{site.name}</div>
      </div>
    ),
    { width: 440, height: 72, fonts: [{ name: "Open Sans", data: bold, weight: 700, style: "normal" }] }
  );
}
