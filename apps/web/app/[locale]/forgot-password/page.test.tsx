import { render, screen } from '@testing-library/react';
import ForgotPasswordPage from './page';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'fr',
}));

describe('ForgotPasswordPage', () => {
  it('renders forgot password title', () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByTestId('forgot-password-title')).toBeInTheDocument();
  });
});