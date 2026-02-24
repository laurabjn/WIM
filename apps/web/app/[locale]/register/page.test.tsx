import { render, screen } from '@testing-library/react';
import RegisterPage from './page';

describe('RegisterPage', () => {
  it('renders register title', () => {
    render(<RegisterPage />);
    expect(screen.getByTestId('title')).toBeInTheDocument();
  });
});