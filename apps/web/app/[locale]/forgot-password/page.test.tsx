import { render, screen } from '@testing-library/react';
import ForgotPasswordPage from './page';

describe('ForgotPasswordPage', () => {
  it('renders forgot password title', () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByTestId('forgot-password-title')).toBeInTheDocument();
  });
});