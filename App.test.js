import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

beforeEach(() => sessionStorage.clear());

test('shows login page first', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
});

test('wrong password stays on login page', () => {
  render(<App />);
  userEvent.type(screen.getByLabelText(/email/i), 'piyush@gmail.com');
  userEvent.type(screen.getByLabelText(/password/i), 'wrong');
  userEvent.click(screen.getByRole('button', { name: /sign in/i }));
  expect(screen.getByRole('alert')).toBeInTheDocument();
  expect(screen.queryByText(/explore our products/i)).not.toBeInTheDocument();
});

test('correct credentials open the dashboard', () => {
  render(<App />);
  userEvent.type(screen.getByLabelText(/email/i), 'piyush@gmail.com');
  userEvent.type(screen.getByLabelText(/password/i), 'Piyush@123');
  userEvent.click(screen.getByRole('button', { name: /sign in/i }));
  expect(screen.getByText(/explore our products/i)).toBeInTheDocument();
});
