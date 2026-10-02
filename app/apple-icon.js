import { ImageResponse } from "next/og";
import { faviconUri } from "@/lib/brandImages";

// The 180 pixel icon for phones' home screens, drawn from the favicon (app/icon.svg).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const svg = await faviconUri();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        <img src={svg} width={size.width} height={size.height} />
      </div>
    ),
    size
  );
}
