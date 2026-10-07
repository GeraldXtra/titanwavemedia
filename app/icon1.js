import { ImageResponse } from "next/og";
import { faviconUri } from "@/lib/brandImages";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
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
