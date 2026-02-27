import { render, screen } from '@testing-library/react';
import LoginPage from './page';

describe('LoginPage', () => {
  it('renders login title', () => {
    render(<LoginPage />);
    expect(screen.getByTestId('title')).toBeInTheDocument();
  });
});