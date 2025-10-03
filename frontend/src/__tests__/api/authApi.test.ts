import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authApi } from '@/lib/api/auth';

/**
 * Tests for Authentication API client
 * Based on: docs/specs/features/authentication.md
 */
describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('register', () => {
    it('should send registration request to API', async () => {
      const mockResponse = {
        user: { email: 'test@example.com', fullName: 'Test User', isVerified: false },
        token: 'mock-jwt-token'
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await authApi.register({
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'SecurePass123!'
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/auth/register',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            fullName: 'Test User',
            password: 'SecurePass123!'
          })
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle registration errors', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({ error: 'Email already registered' })
      });

      await expect(
        authApi.register({
          email: 'existing@example.com',
          fullName: 'Test User',
          password: 'SecurePass123!'
        })
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should send login request to API', async () => {
      const mockResponse = {
        user: { email: 'user@example.com', isVerified: true },
        token: 'mock-jwt-token'
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await authApi.login({
        email: 'user@example.com',
        password: 'SecurePass123!'
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/auth/login',
        expect.objectContaining({
          method: 'POST'
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle invalid credentials error', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid email or password' })
      });

      await expect(
        authApi.login({
          email: 'wrong@example.com',
          password: 'WrongPassword'
        })
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('logout', () => {
    it('should send logout request with token', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'Logged out successfully' })
      });

      await authApi.logout('mock-token');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/auth/logout',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      );
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with token', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ 
          user: { email: 'test@example.com', isVerified: true },
          message: 'Email verified successfully'
        })
      });

      const result = await authApi.verifyEmail('verification-token');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/auth/verify-email?token=verification-token',
        expect.objectContaining({
          method: 'GET'
        })
      );

      expect(result.user.isVerified).toBe(true);
    });
  });

  describe('getCurrentUser', () => {
    it('should fetch current user with auth token', async () => {
      const mockUser = {
        id: '1',
        email: 'user@example.com',
        fullName: 'Test User',
        isVerified: true
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockUser
      });

      const result = await authApi.getCurrentUser('auth-token');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/auth/me',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer auth-token'
          })
        })
      );

      expect(result).toEqual(mockUser);
    });
  });
});

