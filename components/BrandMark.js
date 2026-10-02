// The wave mark. It follows the text colour, so it works on light and dark backgrounds.
export default function BrandMark() {
  return (
    <svg className="brand__mark" viewBox="0 0 40 28" aria-hidden="true">
      <g fill="none" strokeWidth="1.8" strokeLinecap="round">
        <path d="M2 13C8 4 14 4 20 11S32 19 38 7" stroke="currentColor" opacity=".35" />
        <path d="M2 16C8 8 14 8 20 14S32 21 38 11" stroke="currentColor" opacity=".62" />
        <path d="M2 19C8 12 14 12 20 17S32 23 38 15" stroke="#D6452F" opacity=".75" />
        <path d="M2 22C8 16 14 16 20 20S32 25 38 19" stroke="#D6452F" />
      </g>
    </svg>
  );
}
