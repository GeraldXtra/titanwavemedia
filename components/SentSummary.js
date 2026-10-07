"use client";

import { useEffect, useState } from "react";

export default function SentSummary({ title }) {
  const [items, setItems] = useState(null);
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem("twm-last") || "null");
      if (Array.isArray(saved) && saved.length) setItems(saved);
    } catch {}
  }, []);
  return (
    <div className="box" id="ty-sum" hidden={!items}>
      <h2>{title}</h2>
      <dl className="cfg__price" id="ty-list">
        {(items || []).map(([label, value], i) => (
          <div key={i}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
