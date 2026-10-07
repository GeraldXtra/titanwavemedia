"use client";

import { useState } from "react";
import Image from "next/image";
import Icon from "./Icon";
import WorkingLine from "./WorkingLine";
import site from "@/content/site";
import { emailHref } from "@/lib/text";

export default function Founder({ copy }) {
  const [openPart, setOpenPart] = useState(0);

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
        <WorkingLine copy={copy} className="founder__live" id="founder-live" />
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
