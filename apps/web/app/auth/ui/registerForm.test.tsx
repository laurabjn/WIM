import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as registerUsecase from '../application/registerUser.usecase';
import { RegisterForm } from './registerForm';

jest.mock('../application/registerUser.usecase', () => ({
  registerUser: jest.fn(),
}));

const mockRegisterUser = registerUsecase.registerUser as jest.Mock;

describe('<RegisterForm />', () => {
  beforeEach(() => {
    mockRegisterUser.mockReset();
  });

  it('should submit form and call registerUser with form values', async () => {
    mockRegisterUser.mockResolvedValueOnce({
      id: 'uuid-1',
      email: 'test@example.com',
      firstName: 'Laura',
      lastName: 'Bojon',
    });

    render(<RegisterForm />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const firstNameInput = screen.getByTestId('first-name-input');
    const lastNameInput = screen.getByTestId('last-name-input');
    const submitButton = screen.getByTestId('submit-button');

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'SuperPass1');
    await userEvent.type(firstNameInput, 'Laura');
    await userEvent.type(lastNameInput, 'Bojon');

    await userEvent.click(submitButton);

    expect(mockRegisterUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'SuperPass1',
      firstName: 'Laura',
      lastName: 'Bojon',
    });
  });

  it('should show error and not submit if password is too weak', async () => {
    render(<RegisterForm />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('submit-button');

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'abc123'); 
    await userEvent.click(submitButton);

    expect(mockRegisterUser).not.toHaveBeenCalled();

    const errorMessage = await screen.findByTestId('error-input');
    expect(errorMessage).toBeInTheDocument();
  });

  it('should show error and not submit if email is invalid', async () => {
    render(<RegisterForm />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('submit-button');

    await userEvent.type(emailInput, 'not-an-email');
    await userEvent.type(passwordInput, 'SuperPass1');
    await userEvent.click(submitButton);

    const alert = await screen.findByTestId('error-input');
    expect(alert).toBeInTheDocument();
  });

  it('should show error and not submit if some required fields are empty', async () => {
    render(<RegisterForm />);

    const submitButton = screen.getByTestId('submit-button');

    await userEvent.click(submitButton);

    const errorMessage = await screen.findByTestId('error-input');
    expect(errorMessage).toBeInTheDocument();

    expect(mockRegisterUser).not.toHaveBeenCalled();
  });
});