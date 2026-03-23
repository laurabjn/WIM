"use client";

import { AuthForm } from "app/auth/ui/form/AuthForm";
import {useTranslations} from "next-intl";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const t = useTranslations();
  const router = useRouter();

  return (
    <AuthForm
      welcomeTitle={t("auth.goToWim")}
      createAccountLabel={t("auth.register.signUpWithEmail")}
      loginLabel={t("auth.login.login")}
      onCreateAccount={() => router.push("/register")}
      onLogin={() => router.push("/login")}
    />
  );
}