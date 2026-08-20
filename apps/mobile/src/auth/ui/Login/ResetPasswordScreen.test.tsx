import { render, screen, fireEvent } from '@testing-library/react-native';
import * as resetPasswordUsecase from '../../application/resetPassword.usecase';
import { ResetPasswordScreen } from './ResetPasswordScreen';

describe('<ResetPasswordScreen />', () => {
  const mockReset = jest.spyOn(resetPasswordUsecase, 'resetPassword');

  beforeEach(() => {
    mockReset.mockReset();
  });

  it('should not submit if fields are empty and show error', async () => {
    render(<ResetPasswordScreen token="jwt-token" />);

    const submitButton = screen.getByTestId('reset-password-submit-button');

    fireEvent.press(submitButton);

    const error = await screen.findByTestId('reset-password-error');
    expect(error).toBeTruthy();
    expect(mockReset).not.toHaveBeenCalled();
  });

  it('should not submit if passwords do not match and show error', async () => {
    render(<ResetPasswordScreen token="jwt-token" />);

    const newPasswordInput = screen.getByTestId('reset-password-new-password-input');
    const confirmInput = screen.getByTestId('reset-password-confirm-input');
    const submitButton = screen.getByTestId('reset-password-submit-button');

    fireEvent.changeText(newPasswordInput, 'NewPass123');
    fireEvent.changeText(confirmInput, 'OtherPass');
    fireEvent.press(submitButton);

    const error = await screen.findByTestId('reset-password-error');
    expect(error).toBeTruthy();
    expect(mockReset).not.toHaveBeenCalled();
  });

  it('should call resetPassword and show success message when form is valid', async () => {
    mockReset.mockResolvedValueOnce();

    render(<ResetPasswordScreen token="jwt-token" />);

    const newPasswordInput = screen.getByTestId('reset-password-new-password-input');
    const confirmInput = screen.getByTestId('reset-password-confirm-input');
    const submitButton = screen.getByTestId('reset-password-submit-button');

    fireEvent.changeText(newPasswordInput, 'NewPass123');
    fireEvent.changeText(confirmInput, 'NewPass123');
    fireEvent.press(submitButton);

    expect(mockReset).toHaveBeenCalledWith({
      token: 'jwt-token',
      newPassword: 'NewPass123',
    });

    const success = await screen.findByTestId('reset-password-success');
    expect(success).toBeTruthy();
  });
});