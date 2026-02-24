import { render, screen, fireEvent } from '@testing-library/react-native';
import { RegisterScreen } from './RegisterScreen';
import * as authApi from '../infrastructure/api';

describe('<RegisterScreen />', () => {
  const mockRegister = jest.spyOn(authApi, 'registerUserApi');

  beforeEach(() => {
    mockRegister.mockReset();
  });

  it('should not submit if password is weak and show error', async () => {
    render(<RegisterScreen />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('submit-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'abc123');
    fireEvent.press(submitButton);

    expect(mockRegister).not.toHaveBeenCalled();
    const error = await screen.findByTestId('error-message');
    expect(error).toBeTruthy();
  });

  it('should not submit if email is invalid and show error', async () => {
    render(<RegisterScreen />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('submit-button');

    fireEvent.changeText(emailInput, 'nope');
    fireEvent.changeText(passwordInput, 'SuperPass1');
    fireEvent.press(submitButton);

    expect(mockRegister).not.toHaveBeenCalled();
    const error = await screen.findByTestId('error-message');
    expect(error).toBeTruthy();
  });

  it('should show error and not submit if some fields are empty', async () => {
    render(<RegisterScreen />);

    const submitButton = screen.getByTestId('submit-button');

    fireEvent.press(submitButton);

    const error = await screen.findByTestId('error-message');
    expect(error).toBeTruthy();

    expect(mockRegister).not.toHaveBeenCalled();
  });
});