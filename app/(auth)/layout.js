import AuthShell from "@/components/auth/AuthShell";

export const dynamic = "force-dynamic";

export default function AuthLayout({ children }) {
  return <AuthShell>{children}</AuthShell>;
}
