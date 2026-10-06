"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cx, ph } from "@/lib/text";

// How wide a tile's picture shows: one tile a row on phones, two on tablets, three after that.
const SIZES = "(max-width: 640px) 92vw, (max-width: 1000px) 46vw, (max-width: 1440px) 30vw, 430px";

// A project tile. Pointing at it shows the problem and what was built; on a touch screen the
// first tap turns it over for four seconds and the second tap opens the project.
export default function WorkTile({ item, flip }) {
  const [flipped, setFlipped] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  function onClick(e) {
    if (!window.matchMedia("(hover: hover)").matches && !flipped) {
      e.preventDefault();
      setFlipped(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setFlipped(false), 4000);
    }
  }

  const c = item.cover;
  return (
    <Link className={cx("wtile tile", flipped && "is-flipped")} href={`/work/${item.slug}`} data-cat={item.kind} onClick={onClick}>
      <div className="wtile__img">
        {/* Phones get the copy half as wide. */}
        <img
          src={c.src}
          srcSet={`${c.small} ${Math.round(c.width / 2)}w, ${c.src} ${c.width}w`}
          sizes={SIZES}
          width={c.width}
          height={c.height}
          alt={c.alt}
          loading="lazy"
          decoding="async"
        />
        <span className="wtile__flip">
          <b>{flip.problem}</b>
          <span className={ph(item.needed)}>{item.needed}</span>
          <b>{flip.built}</b>
          <span className={ph(item.built)}>{item.built}</span>
        </span>
      </div>
      <div className="wtile__meta">
        <h3>{item.name}</h3>
        <span className="tag">{item.tag}</span>
      </div>
      <p className={ph(item.card)}>{item.card}</p>
    </Link>
  );
}
