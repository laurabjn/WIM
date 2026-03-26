'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LoginForm } from 'app/auth/ui/form/LoginForm';

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();

  return (
    <LoginForm
      title={t('auth.login.title')}
      emailLabel={t('auth.login.email')}
      passwordLabel={t('auth.login.password')}
      forgotPasswordLabel={t('auth.login.forgotPasswordTitle')}
      submitLabel={t('auth.login.login')}
      loadingLabel={t('auth.login.LoggingIn')}
      googleSignUpLabel={t('auth.login.loginWithGoogle')}
      appleSignUpLabel={t('auth.login.loginWithApple')}
      onBack={() => router.push('/')}
      onForgotPassword={() => router.push('/forgot-password')}
      onSuccess={() => router.push('/')}
    />
  );
}