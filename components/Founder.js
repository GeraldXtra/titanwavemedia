"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Icon from "./Icon";
import site from "@/content/site";
import { clock12, workingStatus } from "@/lib/lagos";
import { emailHref, format } from "@/lib/text";

// The founder on the About page: the photo (or the initials until there is one), the story,
// three parts that open one at a time, a line that follows the time in Lagos and the working
// hours, and two ways to get in touch.
export default function Founder({ copy }) {
  const [openPart, setOpenPart] = useState(0);
  const [now, setNow] = useState(null);

  // The server does not know the visitor's moment, so the line is worked out in the browser,
  // then again at the start of every minute.
  useEffect(() => {
    let timer;
    function tick() {
      setNow(Date.now());
      timer = setTimeout(tick, 60000 - (Date.now() % 60000) + 50);
    }
    tick();
    return () => clearTimeout(timer);
  }, []);

  function liveLine(ms) {
    const s = workingStatus(copy.hours, new Date(ms));
    if (s.open) return format(copy.online, { time: s.time });
    const at = clock12(s.hour);
    let next = format(copy.nextLater, { time: at, day: copy.days[s.day] });
    if (s.inDays === 0) next = format(copy.nextToday, { time: at });
    if (s.inDays === 1) next = format(copy.nextTomorrow, { time: at });
    return format(copy.away, { time: s.time, next });
  }

  return (
    <div className="founder">
      <div className="founder__photo">
        {copy.photo ? (
          <Image src={copy.photo} alt={copy.name} fill sizes="(max-width: 1000px) 100vw, 40vw" />
        ) : (
          <span aria-hidden="true">{copy.initials}</span>
        )}
      </div>
      <div>
        <h2>{copy.name}</h2>
        <p className="role">{copy.role}</p>
        <p className="founder__story">{copy.story}</p>
        <div className="founder__parts">
          {copy.parts.map((p, i) => (
            <div className="founder__part" key={p.title}>
              <h3>
                <button
                  type="button"
                  id={`fpart-${i}`}
                  aria-expanded={openPart === i ? "true" : "false"}
                  aria-controls={`fpart-${i}-text`}
                  onClick={() => setOpenPart(openPart === i ? -1 : i)}
                >
                  {p.title}
                </button>
              </h3>
              <div id={`fpart-${i}-text`} role="region" aria-labelledby={`fpart-${i}`} hidden={openPart !== i}>
                <p>{p.text}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="founder__live" id="founder-live">
          {now === null ? " " : liveLine(now)}
        </p>
        <div className="btns">
          <a className="btn btn--solid" href={`${site.whatsappUrl}?text=${encodeURIComponent(copy.whatsapp.start)}`} target="_blank" rel="noopener">
            <Icon name="wa" className={null} />
            <span>{copy.whatsapp.label}</span>
          </a>
          <a className="btn btn--line" href={emailHref(site.email)}>
            <Icon name="mail" className={null} />
            <span>{copy.email.label}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
