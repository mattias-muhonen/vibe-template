import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterForm } from '@/components/auth/RegisterForm';

/**
 * Tests for RegisterForm component
 * Based on: docs/specs/features/authentication.md - User Registration scenario
 * 
 * These tests are written FIRST (TDD approach) and should FAIL until implementation is complete.
 */
describe('RegisterForm', () => {
  const mockOnRegister = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ========================================
  // Scenario: User Registration - Happy Path
  // ========================================

  it('should render registration form with all required fields', () => {
    render(<RegisterForm onRegister={mockOnRegister} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('should register user with valid email, name, and password', async () => {
    const user = userEvent.setup();
    mockOnRegister.mockResolvedValue({
      user: {
        email: 'test@example.com',
        fullName: 'Test User',
        isVerified: false
      },
      token: 'mock-jwt-token'
    });

    render(<RegisterForm onRegister={mockOnRegister} onSuccess={mockOnSuccess} />);

    // Fill in form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/password/i), 'SecurePass123!');

    // Submit form
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(mockOnRegister).toHaveBeenCalledWith({
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'SecurePass123!'
      });
    });
  });

  it('should show success message after registration', async () => {
    const user = userEvent.setup();
    mockOnRegister.mockResolvedValue({
      user: { email: 'test@example.com', fullName: 'Test User', isVerified: false },
      token: 'mock-token'
    });

    render(<RegisterForm onRegister={mockOnRegister} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/password/i), 'SecurePass123!');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/please check your email/i)).toBeInTheDocument();
    });
  });

  // ========================================
  // Email Validation
  // ========================================

  it('should show error for invalid email format', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onRegister={mockOnRegister} />);

    await user.type(screen.getByLabelText(/email/i), 'invalid-email');
    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/password/i), 'SecurePass123!');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
    expect(mockOnRegister).not.toHaveBeenCalled();
  });

  it('should trim whitespace from email', async () => {
    const user = userEvent.setup();
    mockOnRegister.mockResolvedValue({
      user: { email: 'test@example.com', fullName: 'Test User', isVerified: false },
      token: 'mock-token'
    });

    render(<RegisterForm onRegister={mockOnRegister} />);

    await user.type(screen.getByLabelText(/email/i), '  test@example.com  ');
    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/password/i), 'SecurePass123!');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(mockOnRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com' // Should be trimmed
        })
      );
    });
  });

  it('should show error when email is already registered', async () => {
    const user = userEvent.setup();
    mockOnRegister.mockRejectedValue({
      error: 'Email already registered',
      status: 409
    });

    render(<RegisterForm onRegister={mockOnRegister} />);

    await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/password/i), 'SecurePass123!');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/email already registered/i)).toBeInTheDocument();
    });
  });

  // ========================================
  // Password Validation
  // ========================================

  it('should show error for weak password (too short)', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onRegister={mockOnRegister} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/password/i), 'Short1!');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/password must be at least/i)).toBeInTheDocument();
    });
  });

  it('should show error for password without uppercase letter', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onRegister={mockOnRegister} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/password/i), 'nouppercase123!');

    // Should show error immediately or on blur
    await waitFor(() => {
      expect(screen.getByText(/password must contain.*uppercase/i)).toBeInTheDocument();
    });
  });

  it('should show error for password without lowercase letter', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onRegister={mockOnRegister} />);

    await user.type(screen.getByLabelText(/password/i), 'NOLOWERCASE123!');

    await waitFor(() => {
      expect(screen.getByText(/password must contain.*lowercase/i)).toBeInTheDocument();
    });
  });

  it('should show error for password without number', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onRegister={mockOnRegister} />);

    await user.type(screen.getByLabelText(/password/i), 'NoNumbers!');

    await waitFor(() => {
      expect(screen.getByText(/password must contain.*number/i)).toBeInTheDocument();
    });
  });

  it('should show password strength indicator', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onRegister={mockOnRegister} />);

    const passwordInput = screen.getByLabelText(/password/i);

    // Weak password
    await user.type(passwordInput, 'weak');
    expect(screen.getByText(/weak/i)).toBeInTheDocument();

    // Medium password
    await user.clear(passwordInput);
    await user.type(passwordInput, 'Medium123');
    expect(screen.getByText(/medium/i)).toBeInTheDocument();

    // Strong password
    await user.clear(passwordInput);
    await user.type(passwordInput, 'StrongPass123!');
    expect(screen.getByText(/strong/i)).toBeInTheDocument();
  });

  it('should toggle password visibility', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onRegister={mockOnRegister} />);

    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    // Initially hidden (type="password")
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click to show
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();

    // Click to hide again
    await user.click(screen.getByRole('button', { name: /hide password/i }));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  // ========================================
  // Full Name Validation
  // ========================================

  it('should show error when full name is missing', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onRegister={mockOnRegister} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'SecurePass123!');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
    });
  });

  it('should trim whitespace from full name', async () => {
    const user = userEvent.setup();
    mockOnRegister.mockResolvedValue({
      user: { email: 'test@example.com', fullName: 'Test User', isVerified: false },
      token: 'mock-token'
    });

    render(<RegisterForm onRegister={mockOnRegister} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/full name/i), '  Test User  ');
    await user.type(screen.getByLabelText(/password/i), 'SecurePass123!');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(mockOnRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: 'Test User' // Should be trimmed
        })
      );
    });
  });

  // ========================================
  // Loading State
  // ========================================

  it('should show loading state during registration', async () => {
    const user = userEvent.setup();
    let resolveRegister: (value: any) => void;
    const registerPromise = new Promise(resolve => {
      resolveRegister = resolve;
    });
    mockOnRegister.mockReturnValue(registerPromise);

    render(<RegisterForm onRegister={mockOnRegister} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/password/i), 'SecurePass123!');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    // Button should show loading state
    expect(screen.getByRole('button', { name: /signing up/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /signing up/i })).toBeDisabled();

    // Resolve the promise
    resolveRegister!({
      user: { email: 'test@example.com', fullName: 'Test User', isVerified: false },
      token: 'mock-token'
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign up/i })).not.toBeDisabled();
    });
  });

  it('should disable form fields during registration', async () => {
    const user = userEvent.setup();
    let resolveRegister: (value: any) => void;
    const registerPromise = new Promise(resolve => {
      resolveRegister = resolve;
    });
    mockOnRegister.mockReturnValue(registerPromise);

    render(<RegisterForm onRegister={mockOnRegister} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/password/i), 'SecurePass123!');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    // All form fields should be disabled
    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/full name/i)).toBeDisabled();
    expect(screen.getByLabelText(/password/i)).toBeDisabled();
  });

  // ========================================
  // Error Handling
  // ========================================

  it('should display server error message', async () => {
    const user = userEvent.setup();
    mockOnRegister.mockRejectedValue({
      error: 'Server error occurred',
      status: 500
    });

    render(<RegisterForm onRegister={mockOnRegister} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/password/i), 'SecurePass123!');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/server error occurred/i)).toBeInTheDocument();
    });
  });

  it('should handle network error', async () => {
    const user = userEvent.setup();
    mockOnRegister.mockRejectedValue({
      error: 'Network error',
      status: 0
    });

    render(<RegisterForm onRegister={mockOnRegister} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/password/i), 'SecurePass123!');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/network error.*please try again/i)).toBeInTheDocument();
    });
  });

  // ========================================
  // Accessibility
  // ========================================

  it('should have accessible form labels', () => {
    render(<RegisterForm onRegister={mockOnRegister} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should associate error messages with form fields', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onRegister={mockOnRegister} />);

    await user.click(screen.getByRole('button', { name: /sign up/i }));

    const emailInput = screen.getByLabelText(/email/i);
    const emailError = screen.getByText(/email is required/i);

    expect(emailInput).toHaveAttribute('aria-describedby', expect.stringContaining('error'));
    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('should be keyboard navigable', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onRegister={mockOnRegister} />);

    // Tab through form
    await user.tab();
    expect(screen.getByLabelText(/email/i)).toHaveFocus();

    await user.tab();
    expect(screen.getByLabelText(/full name/i)).toHaveFocus();

    await user.tab();
    expect(screen.getByLabelText(/password/i)).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: /show password/i })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: /sign up/i })).toHaveFocus();
  });

  it('should submit form with Enter key', async () => {
    const user = userEvent.setup();
    mockOnRegister.mockResolvedValue({
      user: { email: 'test@example.com', fullName: 'Test User', isVerified: false },
      token: 'mock-token'
    });

    render(<RegisterForm onRegister={mockOnRegister} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/password/i), 'SecurePass123!{Enter}');

    await waitFor(() => {
      expect(mockOnRegister).toHaveBeenCalled();
    });
  });

  // ========================================
  // Link to Login
  // ========================================

  it('should display link to login page', () => {
    render(<RegisterForm onRegister={mockOnRegister} />);

    const loginLink = screen.getByText(/already have an account/i);
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });
});

