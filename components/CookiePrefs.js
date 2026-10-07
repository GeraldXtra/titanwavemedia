"use client";

import { useRef, useState } from "react";
import { remembering, setRemembering } from "@/lib/choices";

export default function CookiePrefs({ copy }) {
  const dialogRef = useRef(null);
  const openRef = useRef(null);
  const [remember, setRemember] = useState(false);

  function open() {
    setRemember(remembering());
    dialogRef.current.showModal();
  }
  function close() {
    dialogRef.current.close();
  }
  function save(e) {
    e.preventDefault();
    setRemembering(remember);
    close();
  }

  return (
    <>
      <button className="foot__btn" type="button" ref={openRef} onClick={open}>
        {copy.open}
      </button>
      <dialog className="cookies" ref={dialogRef} aria-labelledby="cookies-title" onClose={() => openRef.current && openRef.current.focus()}>
        <form onSubmit={save}>
          <h2 id="cookies-title">{copy.title}</h2>
          <p>{copy.text}</p>
          <p>{copy.theme}</p>
          <label className="switch">
            <input type="checkbox" role="switch" checked={remember} aria-describedby="cookies-help" onChange={(e) => setRemember(e.target.checked)} />
            <span className="switch__track" aria-hidden="true" />
            <span>{copy.remember}</span>
          </label>
          <p className="note" id="cookies-help">
            {copy.rememberHelp}
          </p>
          <div className="btns">
            <button className="btn btn--line" type="submit">
              {copy.save}
            </button>
            <button className="btn btn--line" type="button" onClick={close}>
              {copy.close}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
