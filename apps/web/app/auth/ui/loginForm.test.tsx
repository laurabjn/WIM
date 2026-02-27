import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './loginForm';
import * as loginUsecase from '../application/loginUser.usecase';

describe('<LoginForm />', () => {
  const mockLoginUser = jest.spyOn(loginUsecase, 'loginUser');

  beforeEach(() => {
    mockLoginUser.mockReset();
  });

  it('should call loginUser with form values', async () => {
    mockLoginUser.mockResolvedValueOnce({
      user: {
        id: 'uuid-1',
        email: 'test@example.com',
        firstName: 'Laura',
        lastName: 'Bojon',
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    render(<LoginForm />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('submit-button');

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'secret123');
    await userEvent.click(submitButton);

    expect(mockLoginUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'secret123',
    });
  });

  it('should show error if login fails', async () => {
    mockLoginUser.mockRejectedValueOnce(new Error('Invalid email or password'));

    render(<LoginForm />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('submit-button');

    await userEvent.type(emailInput, 'wrong@example.com');
    await userEvent.type(passwordInput, 'badpass');
    await userEvent.click(submitButton);

    const errorMessage = await screen.findByTestId('error-input');
    expect(errorMessage).toBeInTheDocument();
  });
});