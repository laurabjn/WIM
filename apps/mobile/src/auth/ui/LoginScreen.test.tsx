import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from './LoginScreen';

jest.mock('../application/loginUser.usecase', () => ({
  loginUserApi: jest.fn(),
}));

import { loginUserApi } from '../application/loginUser.usecase';

const mockLogin = loginUserApi as jest.Mock

describe('<LoginScreen />', () => {

  beforeEach(() => {
    mockLogin.mockReset();
  });

  it('should not submit if password is weak and show error', async () => {
    render(<LoginScreen />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('submit-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'abc123');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
    });

    const error = await screen.findByTestId('error-message');
    expect(error).toBeTruthy();
  });

  it('should not submit if email is invalid and show error', async () => {
    render(<LoginScreen />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('submit-button');

    fireEvent.changeText(emailInput, 'nope');
    fireEvent.changeText(passwordInput, 'SuperPass1');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
    });

    const error = await screen.findByTestId('error-message');
    expect(error).toBeTruthy();
  });

  it('should show error and not submit if some fields are empty', async () => {
    render(<LoginScreen />);

    const submitButton = screen.getByTestId('submit-button');

    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
    });

    const error = await screen.findByTestId('error-message');
    expect(error).toBeTruthy();
  });
});