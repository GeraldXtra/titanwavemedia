"use client";

import { useEffect, useRef } from "react";
import Icon from "../Icon";
import shell from "@/content/console/shell";

// A window over the console, built on the browser's own <dialog>: focus stays inside it,
// Escape closes it, and focus goes back to what opened it.
export default function Dialog({ open, onClose, title, sub, wide = false, children, labelId }) {
  const ref = useRef(null);
  const opener = useRef(null);
  const id = labelId || `dlg-${String(title).replace(/\W+/g, "-").toLowerCase()}`;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = document.activeElement;
      d.showModal();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  function closed() {
    if (opener.current && document.body.contains(opener.current)) opener.current.focus();
    if (open) onClose();
  }

  return (
    <dialog
      ref={ref}
      className={`c-dialog${wide ? " c-dialog--wide" : ""}`}
      aria-labelledby={id}
      onClose={closed}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="c-dialog__top">
        <div>
          <h2 id={id}>{title}</h2>
          {sub && <small>{sub}</small>}
        </div>
        <button className="c-close" type="button" onClick={onClose} aria-label={shell.close}>
          <Icon name="close" className={null} />
        </button>
      </div>
      <div className="c-dialog__body">{open ? children : null}</div>
    </dialog>
  );
}
