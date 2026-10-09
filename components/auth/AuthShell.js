import "@/app/console.css";
import Link from "next/link";
import Rich from "../Rich";
import CookiePrefs from "../CookiePrefs";
import ThemeFollow from "../ThemeFollow";
import Wave from "../Wave";
import { Year } from "../Live";
import ConsoleSprite from "../console/ConsoleSprite";
import site from "@/content/site";
import copy from "@/content/console/signin";

export default function AuthShell({ children }) {
  return (
    <div className="si">
      <ConsoleSprite />
      <ThemeFollow />
      <Wave kind="signin" className="si__wave" fade=".si__col" />
      <div className="si__top">
        <Link className="si__home" href="/" aria-label={copy.homeLabel}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M10 3 5 8l5 5" />
          </svg>
          {copy.home}
        </Link>
      </div>
      <main className="si__main" id="main">
        <div className="si__col">{children}</div>
      </main>
      <footer className="si__foot">
        <span>
          <Rich text={copy.footer.line} tokens={{ year: <Year initial={new Date().getFullYear()} /> }} />
        </span>
        <nav aria-label={copy.footer.label}>
          <Link href="/privacy-policy">{copy.footer.privacy}</Link>
          <Link href="/terms">{copy.footer.terms}</Link>
          <Link href="/support">{copy.footer.help}</Link>
          <CookiePrefs copy={site.cookies} />
        </nav>
      </footer>
    </div>
  );
}
