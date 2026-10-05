// One screenshot in the site guide, with numbered squares and arrows drawn on top of it (real
// text and lines, not part of the image, so they stay sharp and can be read), and the numbered
// list that says what each one is. Positions come from content/guide.js, as percentages of the
// screenshot. Under 700px wide the arrows are hidden and the list sits under the picture.
export default function GuideShot({ shot, id, eager = false }) {
  const { width: w, height: h } = shot;
  const px = (p, size) => Math.round((p / 100) * size * 10) / 10;
  return (
    <div className="gshot">
      <figure className="gshot__fig">
        <div className="gshot__img">
          {/* Phones get a copy half as wide, from public/guide/phone/. */}
          <picture>
            <source media="(max-width: 700px)" srcSet={shot.src.replace("/guide/", "/guide/phone/")} width={w / 2} height={h / 2} />
            <img
              src={shot.src}
              width={w}
              height={h}
              alt={shot.alt}
              loading={eager ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={eager ? "high" : undefined}
            />
          </picture>
          <svg className="gshot__arrows" viewBox={`0 0 ${w} ${h}`} aria-hidden="true" focusable="false">
            <defs>
              <marker id={`${id}-head`} viewBox="0 0 12 12" refX="10" refY="6" markerWidth="16" markerHeight="16" markerUnits="userSpaceOnUse" orient="auto">
                <path d="M1 1 11 6 1 11Z" />
              </marker>
            </defs>
            {shot.markers.map((m) => (
              <g key={m.n}>
                <line className="gshot__halo" x1={px(m.x, w)} y1={px(m.y, h)} x2={px(m.to.x, w)} y2={px(m.to.y, h)} />
                <line className="gshot__line" x1={px(m.x, w)} y1={px(m.y, h)} x2={px(m.to.x, w)} y2={px(m.to.y, h)} markerEnd={`url(#${id}-head)`} />
              </g>
            ))}
          </svg>
          {shot.markers.map((m) => (
            <span className="gmark gmark--on" key={m.n} style={{ left: `${m.x}%`, top: `${m.y}%` }} aria-hidden="true">
              {m.n}
            </span>
          ))}
        </div>
      </figure>
      <ol className="gshot__list" role="list">
        {shot.markers.map((m) => (
          <li key={m.n}>
            <span className="gmark" aria-hidden="true">
              {m.n}
            </span>
            <span>{m.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
