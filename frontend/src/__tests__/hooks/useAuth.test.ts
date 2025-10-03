import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '@/hooks/useAuth';

/**
 * Tests for useAuth hook
 * Based on: docs/specs/features/authentication.md
 */
describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with no user', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('should register a new user', async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(async () => {
      await result.current.register({
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'SecurePass123!'
      });
    });

    expect(result.current.user).toMatchObject({
      email: 'test@example.com',
      fullName: 'Test User'
    });
  });

  it('should login a user', async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(async () => {
      await result.current.login({
        email: 'user@example.com',
        password: 'SecurePass123!'
      });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeTruthy();
  });

  it('should logout a user', async () => {
    const { result } = renderHook(() => useAuth());

    // Login first
    await waitFor(async () => {
      await result.current.login({
        email: 'user@example.com',
        password: 'SecurePass123!'
      });
    });

    // Then logout
    await waitFor(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should store token in localStorage', async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(async () => {
      await result.current.login({
        email: 'user@example.com',
        password: 'SecurePass123!'
      });
    });

    expect(localStorage.getItem('auth_token')).toBeTruthy();
  });

  it('should handle authentication errors', async () => {
    const { result } = renderHook(() => useAuth());

    await expect(async () => {
      await result.current.login({
        email: 'wrong@example.com',
        password: 'WrongPassword'
      });
    }).rejects.toThrow();
  });
});

