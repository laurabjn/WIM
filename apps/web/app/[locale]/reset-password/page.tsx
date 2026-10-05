import { getTranslations } from 'next-intl/server';
import { ResetPasswordForm } from '../../auth/ui/resetPasswordForm';

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;
  const t = await getTranslations('auth');

  if (!token) {
    return (
      <main>
        <p data-testid="missing-token-message">{t('login.missingToken')}</p>
      </main>
    );
  }

  return (
    <main>
      <ResetPasswordForm token={token} />
    </main>
  );
}
