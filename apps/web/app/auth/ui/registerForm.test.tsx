import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from './registerForm';
import { registerUser } from '../application/registerUser.usecase';

jest.mock('../application/registerUser.usecase', () => ({
  registerUser: jest.fn(),
}));

const mockedRegisterUser = registerUser as jest.MockedFunction<
  typeof registerUser
>;

describe('<RegisterForm />', () => {

  beforeEach(() => {
    mockedRegisterUser.mockReset();
  });

  it('should submit form and call registerUser with form values', async () => {
    mockedRegisterUser.mockResolvedValueOnce({
      id: 'uuid-1',
      email: 'test@example.com',
      firstName: 'Laura',
      lastName: 'Bojon',
    });

    render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const firstNameInput = screen.getByLabelText(/prénom/i);
    const lastNameInput = screen.getByLabelText(/^nom$/i);
    const submitButton = screen.getByRole('button', { name: /créer mon compte/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'secret123');
    await userEvent.type(firstNameInput, 'Laura');
    await userEvent.type(lastNameInput, 'Bojon');

    await userEvent.click(submitButton);

    expect(mockedRegisterUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'secret123',
      firstName: 'Laura',
      lastName: 'Bojon',
    });
  });

  it('should display an error message if registration fails', async () => {
    mockedRegisterUser.mockRejectedValueOnce(new Error('Email already in use'));

    render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /créer mon compte/i });

    await userEvent.type(emailInput, 'existing@example.com');
    await userEvent.type(passwordInput, 'secret123');
    await userEvent.click(submitButton);

    const errorMessage = await screen.findByText(/email already in use/i);
    expect(errorMessage).toBeInTheDocument();
  });
});