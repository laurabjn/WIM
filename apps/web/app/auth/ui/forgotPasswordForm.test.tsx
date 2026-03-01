import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as usecase from '../application/requestPasswordReset.usecase';
import { ForgotPasswordForm } from './forgotPasswordForm';

describe('<ForgotPasswordForm />', () => {
  const mockRequest = jest.spyOn(usecase, 'requestPasswordReset');

  beforeEach(() => {
    mockRequest.mockReset();
  });

  it('should call requestPasswordReset with email', async () => {
    mockRequest.mockResolvedValueOnce();

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByTestId('email-input');
    const submitButton = screen.getByTestId('submit-button');

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.click(submitButton);

    expect(mockRequest).toHaveBeenCalledWith('test@example.com');
  });

  it('should show success message on success', async () => {
    mockRequest.mockResolvedValueOnce();

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByTestId('email-input');
    const submitButton = screen.getByTestId('submit-button');

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.click(submitButton);

    const msg = await screen.getByTestId('success-input');
    expect(msg).toBeInTheDocument();
  });
});