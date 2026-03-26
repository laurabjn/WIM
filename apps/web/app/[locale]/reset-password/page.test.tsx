import { render, screen } from '@testing-library/react';
import ResetPasswordPage from './page';

describe('ResetPasswordPage', () => {
  it('renders error message when token is missing', () => {
    render(
      <ResetPasswordPage
        searchParams={{
          token: undefined,
        }}
      />,
    );

    expect(screen.getByTestId('missing-token-message')).toBeInTheDocument();
  });

  it('renders reset password title when token is provided', () => {
    render(
      <ResetPasswordPage
        searchParams={{
          token: 'test-token',
        }}
      />,
    );

    expect(
      screen.getByTestId('reset-password-title'),
    ).toBeInTheDocument();
  });
});