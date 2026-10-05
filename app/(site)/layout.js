import SiteChrome from "@/components/SiteChrome";

// The public website. Sign in and the console have their own layouts.
export default function SiteLayout({ children }) {
  return <SiteChrome>{children}</SiteChrome>;
}
