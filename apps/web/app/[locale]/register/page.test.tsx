import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('@/app/auth/ui/registerWizard', () => ({
  RegisterWizard: () => <div>RegisterWizardMock</div>,
}));

import RegisterPage from './page';

describe('RegisterPage', () => {
  it('renders', () => {
    render(<RegisterPage />);
    expect(screen.getByText('RegisterWizardMock')).toBeInTheDocument();
  });
});