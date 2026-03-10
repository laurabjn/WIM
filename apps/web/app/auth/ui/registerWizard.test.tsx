import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('../application/registerUser.usecase', () => ({
  registerUser: jest.fn(),
}));

import { registerUser } from '../application/registerUser.usecase';

const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

import { RegisterWizard } from './RegisterWizard';

describe('RegisterWizard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function getInputByPlaceholder(placeholderKey: string) {
    return screen.getByPlaceholderText(placeholderKey);
  }

  it('should navigate from step 0 -> 1 -> 2', async () => {
    const user = userEvent.setup();
    render(<RegisterWizard />);

    const startBtn = screen.getByRole('button', {
      name: 'auth.register.signUpWithEmail',
    });
    await user.click(startBtn);

    expect(screen.getByText('auth.register.title')).toBeInTheDocument();

    const continueBtn = screen.getByRole('button', { name: 'continue' });
    await user.click(continueBtn);

    expect(screen.getByText('auth.register.picture')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('auth.register.biography'),
    ).toBeInTheDocument();
  });

  it('should call registerUser on step 2 and move to step 3 with identityRedirectUrl', async () => {
    const user = userEvent.setup();

    (registerUser as jest.Mock).mockResolvedValueOnce({
      identityRedirectUrl: 'https://identity.test/verify?session=abc',
    });

    render(<RegisterWizard />);

    await user.click(
      screen.getByRole('button', { name: 'auth.register.signUpWithEmail' }),
    );

    await user.type(getInputByPlaceholder('auth.register.lastName'), 'Bojon');
    await user.type(getInputByPlaceholder('auth.register.firstName'), 'Laura');
    await user.type(getInputByPlaceholder('auth.register.birthdate'), '1995-01-01');
    await user.type(getInputByPlaceholder('auth.register.nationality'), 'FR');
    await user.type(
      getInputByPlaceholder('auth.register.countryOfResidence'),
      'France',
    );
    await user.type(getInputByPlaceholder('auth.register.email'), 'laura@test.com');
    await user.type(getInputByPlaceholder('auth.register.phone'), '0699117838');
    await user.type(getInputByPlaceholder('auth.register.password'), 'Password123!');

    await user.click(screen.getByRole('button', { name: 'continue' }));

    await user.click(screen.getByRole('button', { name: 'continue' }));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledTimes(1);
    });

    expect(registerUser).toHaveBeenCalledWith({
      email: 'laura@test.com',
      password: 'Password123!',
      firstName: 'Laura',
      lastName: 'Bojon',
    });

    expect(
      screen.getByText('auth.register.identityVerification'),
    ).toBeInTheDocument();

    const beginBtn = screen.getByRole('button', {
      name: 'auth.register.beginIdentityVerification',
    });
    expect(beginBtn).toBeEnabled();
  });

  it('should redirect to identity url when clicking beginIdentityVerification', async () => {
    const user = userEvent.setup();

    (registerUser as jest.Mock).mockResolvedValueOnce({
      identityRedirectUrl: 'https://identity.test/verify?session=abc',
    });

    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ...originalLocation,
        assign: jest.fn(),
      },
    });

    render(<RegisterWizard />);

    await user.click(
      screen.getByRole('button', { name: 'auth.register.signUpWithEmail' }),
    );

    await user.type(
      screen.getByPlaceholderText('auth.register.lastName'),
      'Bojon',
    );
    await user.type(
      screen.getByPlaceholderText('auth.register.firstName'),
      'Laura',
    );
    await user.type(
      screen.getByPlaceholderText('auth.register.email'),
      'laura@test.com',
    );
    await user.type(
      screen.getByPlaceholderText('auth.register.password'),
      'Password123!',
    );

    await user.click(screen.getByRole('button', { name: 'continue' }));
    await user.click(screen.getByRole('button', { name: 'continue' }));

    await user.click(
      screen.getByRole('button', {
        name: 'auth.register.beginIdentityVerification',
      }),
    );

    expect(window.location.assign).toHaveBeenCalledWith(
      'https://identity.test/verify?session=abc',
    );

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('should go back from step 3 to step 2 when clicking back arrow', async () => {
    const user = userEvent.setup();

    (registerUser as jest.Mock).mockResolvedValueOnce({
      identityRedirectUrl: 'https://identity.test/verify?session=abc',
    });

    render(<RegisterWizard />);

    await user.click(
      screen.getByRole('button', { name: 'auth.register.signUpWithEmail' }),
    );

    await user.type(getInputByPlaceholder('auth.register.lastName'), 'Bojon');
    await user.type(getInputByPlaceholder('auth.register.firstName'), 'Laura');
    await user.type(getInputByPlaceholder('auth.register.email'), 'laura@test.com');
    await user.type(getInputByPlaceholder('auth.register.password'), 'Password123!');

    await user.click(screen.getByRole('button', { name: 'continue' }));
    await user.click(screen.getByRole('button', { name: 'continue' }));

    const backButton = screen.getAllByRole('button', { name: '←' }).at(0);
    expect(backButton).toBeDefined();
    await user.click(backButton!);

    expect(screen.getByText('auth.register.picture')).toBeInTheDocument();
  });

  it('should display genericError when registerUser throws', async () => {
    const user = userEvent.setup();

    (registerUser as jest.Mock).mockRejectedValueOnce(new Error('Boom'));

    render(<RegisterWizard />);

    await user.click(
      screen.getByRole('button', { name: 'auth.register.signUpWithEmail' }),
    );

    await user.type(getInputByPlaceholder('auth.register.lastName'), 'Bojon');
    await user.type(getInputByPlaceholder('auth.register.firstName'), 'Laura');
    await user.type(getInputByPlaceholder('auth.register.email'), 'laura@test.com');
    await user.type(getInputByPlaceholder('auth.register.password'), 'Password123!');

    await user.click(screen.getByRole('button', { name: 'continue' }));
    await user.click(screen.getByRole('button', { name: 'continue' }));

    await waitFor(() => {
      expect(screen.getByText('Boom')).toBeInTheDocument();
    });
  });
});