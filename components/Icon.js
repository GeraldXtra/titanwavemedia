// An icon from the sprite in SvgSprite.js. Buttons pass className={null}, like the design.
export default function Icon({ name, className = "ico" }) {
  return (
    <svg className={className || undefined} aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  );
}
