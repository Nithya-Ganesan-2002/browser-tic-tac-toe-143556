import { render, screen } from '@testing-library/react';
import App from './App';

// PUBLIC_INTERFACE
test('renders main header', () => {
  render(<App />);
  expect(screen.getByText(/Tic Tac Toe/i)).toBeInTheDocument();
});
