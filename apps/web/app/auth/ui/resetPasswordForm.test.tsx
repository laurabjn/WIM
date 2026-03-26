import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as usecase from '../application/resetPassword.usecase';
import { ResetPasswordForm } from './resetPasswordForm';

describe('<ResetPasswordForm />', () => {
  const mockReset = jest.spyOn(usecase, 'resetPassword');

  beforeEach(() => {
    mockReset.mockReset();
  });

  it('should call resetPassword with token and newPassword', async () => {
    mockReset.mockResolvedValueOnce();

    render(<ResetPasswordForm token="jwt-token" />);

    const newPasswordInput = screen.getByTestId('new-password-input');
    const confirmInput = screen.getByTestId('confirm-password-input');
    const submitButton = screen.getByTestId('submit-button');

    await userEvent.type(newPasswordInput, 'NewPass123');
    await userEvent.type(confirmInput, 'NewPass123');
    await userEvent.click(submitButton);

    expect(mockReset).toHaveBeenCalledWith({
      token: 'jwt-token',
      newPassword: 'NewPass123',
    });
  });

  it('should show error if passwords do not match', async () => {
    render(<ResetPasswordForm token="jwt-token" />);

    const newPasswordInput = screen.getByTestId('new-password-input');
    const confirmInput = screen.getByTestId('confirm-password-input');
    const submitButton = screen.getByTestId('submit-button');

    await userEvent.type(newPasswordInput, 'NewPass123');
    await userEvent.type(confirmInput, 'OtherPass');
    await userEvent.click(submitButton);

    const error = await screen.getByTestId('error-input');
    expect(error).toBeInTheDocument();
    expect(mockReset).not.toHaveBeenCalled();
  });
});