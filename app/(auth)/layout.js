import AuthShell from "@/components/auth/AuthShell";

// Sign in, Create your account, Check your email, Enter your code, This link has expired, and
// the page a sign in link opens.
export default function AuthLayout({ children }) {
  return <AuthShell>{children}</AuthShell>;
}
