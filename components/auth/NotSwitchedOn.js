import Link from "next/link";
import Icon from "../Icon";
import { SignInMark } from "./Parts";
import site from "@/content/site";
import copy from "@/content/console/signin";

export default function NotSwitchedOn() {
  const t = copy.off;
  return (
    <>
      <SignInMark icon="lock" />
      <h1>{t.title}</h1>
      <p className="si__sub">{t.text}</p>
      <div className="si__actions">
        <a className="btn btn--solid si__btn" href={site.whatsappUrl} target="_blank" rel="noopener">
          <Icon name="wa" className={null} />
          {t.whatsapp}
        </a>
        <Link className="btn si__btn" href="/contact">
          {t.contact}
        </Link>
      </div>
    </>
  );
}
