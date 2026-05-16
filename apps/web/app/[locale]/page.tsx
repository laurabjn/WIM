"use client";

import { AuthForm } from "app/auth/ui/form/AuthForm";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <AuthForm
      onCreateAccount={() => router.push("/register")}
      onLogin={() => router.push("/login")}
    />
  );
}