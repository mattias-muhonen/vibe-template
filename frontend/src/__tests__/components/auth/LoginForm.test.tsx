import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginForm } from '@/components/auth/LoginForm';

/**
 * Tests for LoginForm component
 * Based on: docs/specs/features/authentication.md - Login scenarios
 */
describe('LoginForm', () => {
  const mockOnLogin = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form with email and password fields', () => {
    render(<LoginForm onLogin={mockOnLogin} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('should login with valid credentials', async () => {
    const user = userEvent.setup();
    mockOnLogin.mockResolvedValue({
      user: { email: 'user@example.com', isVerified: true },
      token: 'mock-token'
    });

    render(<LoginForm onLogin={mockOnLogin} />);

    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'SecurePass123!');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'SecurePass123!'
      });
    });
  });

  it('should show error for invalid credentials', async () => {
    const user = userEvent.setup();
    mockOnLogin.mockRejectedValue({
      error: 'Invalid email or password',
      status: 401
    });

    render(<LoginForm onLogin={mockOnLogin} />);

    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'WrongPassword');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  it('should show error for unverified account', async () => {
    const user = userEvent.setup();
    mockOnLogin.mockRejectedValue({
      error: 'Please verify your email before logging in',
      status: 403
    });

    render(<LoginForm onLogin={mockOnLogin} />);

    await user.type(screen.getByLabelText(/email/i), 'unverified@example.com');
    await user.type(screen.getByLabelText(/password/i), 'SecurePass123!');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/please verify your email/i)).toBeInTheDocument();
      expect(screen.getByText(/verification email has been sent/i)).toBeInTheDocument();
    });
  });

  it('should show loading state during login', async () => {
    const user = userEvent.setup();
    let resolveLogin: (value: any) => void;
    mockOnLogin.mockReturnValue(new Promise(resolve => { resolveLogin = resolve; }));

    render(<LoginForm onLogin={mockOnLogin} />);

    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'SecurePass123!');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(<LoginForm onLogin={mockOnLogin} />);

    await user.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('should display link to signup page', () => {
    render(<LoginForm onLogin={mockOnLogin} />);

    const signupLink = screen.getByText(/don't have an account/i);
    expect(signupLink).toBeInTheDocument();
    expect(signupLink.closest('a')).toHaveAttribute('href', '/signup');
  });

  it('should display forgot password link', () => {
    render(<LoginForm onLogin={mockOnLogin} />);

    const forgotLink = screen.getByText(/forgot password/i);
    expect(forgotLink).toBeInTheDocument();
  });
});

