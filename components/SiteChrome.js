import SkipLink from "./SkipLink";
import Header from "./Header";
import Footer from "./Footer";
import ScrollUi from "./ScrollUi";
import ChatWidget from "./ChatWidget";
import SiteEffects from "./SiteEffects";
import site from "@/content/site";

// The public website around a page: header, footer, back to top, the assistant and the shared
// behaviour. Used by every public page and by the "Page not found" page.
export default function SiteChrome({ children }) {
  return (
    <>
      <SkipLink label={site.skipLink} />
      <Header />
      <div id="content">{children}</div>
      <Footer />
      <ScrollUi />
      <ChatWidget />
      <SiteEffects />
    </>
  );
}
