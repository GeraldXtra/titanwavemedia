export default function Icon({ name, className = "ico" }) {
  return (
    <svg className={className || undefined} aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  );
}
