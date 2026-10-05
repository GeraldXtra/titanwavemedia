import "@/app/console.css";
import Link from "next/link";
import BrandMark from "../BrandMark";
import Rich from "../Rich";
import CookiePrefs from "../CookiePrefs";
import { Year } from "../Live";
import ConsoleSprite from "../console/ConsoleSprite";
import site from "@/content/site";
import copy from "@/content/console/signin";

// The frame of the sign in pages: a white card on grey with our name at the top, and the
// company line, the policies and help under it.
export default function AuthShell({ children }) {
  return (
    <div className="auth">
      <ConsoleSprite />
      <main className="auth__card" id="main">
        <Link className="auth__brand" href="/" aria-label={copy.homeLabel}>
          <BrandMark />
          <span>{copy.brand}</span>
        </Link>
        {children}
      </main>
      <footer className="afoot">
        <p>
          <Rich text={copy.footer.line} tokens={{ year: <Year initial={new Date().getFullYear()} /> }} />
        </p>
        <ul aria-label={copy.footer.label}>
          <li>
            <Link href="/privacy-policy">{copy.footer.privacy}</Link>
          </li>
          <li>
            <Link href="/terms">{copy.footer.terms}</Link>
          </li>
          <li>
            <CookiePrefs copy={site.cookies} />
          </li>
          <li>
            <a href={site.whatsappUrl} target="_blank" rel="noopener">
              {copy.footer.help}
            </a>
          </li>
        </ul>
      </footer>
    </div>
  );
}
