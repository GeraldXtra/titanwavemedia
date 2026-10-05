import Link from "next/link";
import Icon from "../Icon";
import site from "@/content/site";
import copy from "@/content/console/signin";

// Shown on /console and the sign in pages until every setting in .env.example is filled in.
export default function NotSwitchedOn() {
  const t = copy.off;
  return (
    <>
      <div className="auth__icon">
        <Icon name="lock" />
      </div>
      <h1>{t.title}</h1>
      <p className="lede">{t.text}</p>
      <div className="btns" style={{ marginTop: 20 }}>
        <a className="btn btn--solid" href={site.whatsappUrl} target="_blank" rel="noopener">
          <Icon name="wa" className={null} />
          {t.whatsapp}
        </a>
        <Link className="btn" href="/contact">
          {t.contact}
        </Link>
      </div>
    </>
  );
}
