"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cx, ph } from "@/lib/text";

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

  return (
    <Link className={cx("wtile tile", flipped && "is-flipped")} href={`/work/${item.slug}`} data-cat={item.cat} onClick={onClick}>
      <div className="ph-box">
        {item.screenshot}
        <span className="wtile__flip">
          <b>{flip.problem}</b>
          <span className={ph(item.needed)}>{item.needed}</span>
          <b>{flip.built}</b>
          <span className={ph(item.built)}>{item.built}</span>
        </span>
      </div>
      <div className="wtile__meta">
        <h3 className={ph(item.client)}>{item.client}</h3>
        <span className="tag">{item.tag}</span>
      </div>
      <p className={ph(item.built)}>{item.built}</p>
    </Link>
  );
}
