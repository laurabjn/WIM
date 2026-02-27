import { render, screen, fireEvent } from '@testing-library/react-native';
import * as loginUserApi from '../application/loginUser.usecase';
import { LoginScreen } from './LoginScreen';

describe('<LoginScreen />', () => {
  const mockLogin = jest.spyOn(loginUserApi, 'loginUserApi');

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

    expect(mockLogin).not.toHaveBeenCalled();
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

    expect(mockLogin).not.toHaveBeenCalled();
    const error = await screen.findByTestId('error-message');
    expect(error).toBeTruthy();
  });

  it('should show error and not submit if some fields are empty', async () => {
    render(<LoginScreen />);

    const submitButton = screen.getByTestId('submit-button');

    fireEvent.press(submitButton);

    const error = await screen.findByTestId('error-message');
    expect(error).toBeTruthy();

    expect(mockLogin).not.toHaveBeenCalled();
  });
});