import type { Metadata } from "next";
import LoginForm from "./LoginForm";
export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};
export default function LoginPage() {
  return <LoginForm />;
}
