import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import * as requestPasswordResetUsecase from '../application/requestPassword.usecase';
import { ForgotPasswordScreen } from './ForgotPasswordScreen';

describe('<ForgotPasswordScreen />', () => {
  const mockRequest = jest.spyOn(
    requestPasswordResetUsecase,
    'requestPasswordReset',
  );

  beforeEach(() => {
    mockRequest.mockReset();
    mockRequest.mockResolvedValue(undefined);
  });

  it('should not submit if email is empty and show error', async () => {
    render(<ForgotPasswordScreen />);

    const submitButton = screen.getByTestId('forgot-password-submit-button');

    fireEvent.press(submitButton);

    const error = await screen.findByTestId('forgot-password-error');
    expect(error).toBeTruthy();
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it('should call requestPasswordReset and show success message on valid email', async () => {
    mockRequest.mockResolvedValueOnce();

    render(<ForgotPasswordScreen />);

    const emailInput = screen.getByTestId('forgot-password-email-input');
    const submitButton = screen.getByTestId('forgot-password-submit-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalledWith('test@example.com', 'fr');
    });

    const success = await screen.findByTestId('forgot-password-success');
    expect(success).toBeTruthy();
  });
});