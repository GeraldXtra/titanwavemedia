"use client";

import { useRef, useState } from "react";
import { toast } from "@/lib/toast";
import copy from "@/content/console/assist";

const t = copy.test;
const FRESH_FOR = 100 * 60 * 1000;

export default function TestChat({ src, title }) {
  const [n, setN] = useState(0);
  const opened = useRef(Date.now());

  function restart() {
    if (Date.now() - opened.current > FRESH_FOR) {
      window.location.reload();
      return;
    }
    setN((x) => x + 1);
    toast(t.restarted);
  }

  return (
    <div className="as-test">
      <div className="btns">
        <button className="btn btn--sm" type="button" onClick={restart}>
          {t.restart}
        </button>
      </div>
      <iframe key={n} className="as-frame" src={src} title={title} />
    </div>
  );
}
