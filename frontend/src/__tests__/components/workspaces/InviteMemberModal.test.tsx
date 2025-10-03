import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { InviteMemberModal } from '@/components/workspaces/InviteMemberModal';

/**
 * Tests for InviteMemberModal component
 * Based on: docs/specs/features/workspace-management.md - Invite User to Workspace
 */
describe('InviteMemberModal', () => {
  const mockOnInvite = vi.fn();
  const mockOnClose = vi.fn();

  it('should render invite member form', () => {
    render(<InviteMemberModal isOpen={true} onInvite={mockOnInvite} onClose={mockOnClose} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send invitation/i })).toBeInTheDocument();
  });

  it('should send invitation with valid email and role', async () => {
    const user = userEvent.setup();
    mockOnInvite.mockResolvedValue({ success: true });

    render(<InviteMemberModal isOpen={true} onInvite={mockOnInvite} onClose={mockOnClose} />);

    await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
    await user.selectOptions(screen.getByLabelText(/role/i), 'MEMBER');
    await user.click(screen.getByRole('button', { name: /send invitation/i }));

    await waitFor(() => {
      expect(mockOnInvite).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        role: 'MEMBER'
      });
    });
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    render(<InviteMemberModal isOpen={true} onInvite={mockOnInvite} onClose={mockOnClose} />);

    await user.type(screen.getByLabelText(/email/i), 'invalid-email');
    await user.click(screen.getByRole('button', { name: /send invitation/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
    expect(mockOnInvite).not.toHaveBeenCalled();
  });

  it('should show error for duplicate invitation', async () => {
    const user = userEvent.setup();
    mockOnInvite.mockRejectedValue({
      error: 'User is already a member',
      status: 409
    });

    render(<InviteMemberModal isOpen={true} onInvite={mockOnInvite} onClose={mockOnClose} />);

    await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
    await user.click(screen.getByRole('button', { name: /send invitation/i }));

    await waitFor(() => {
      expect(screen.getByText(/already a member/i)).toBeInTheDocument();
    });
  });

  it('should default role to MEMBER', () => {
    render(<InviteMemberModal isOpen={true} onInvite={mockOnInvite} onClose={mockOnClose} />);

    expect(screen.getByLabelText(/role/i)).toHaveValue('MEMBER');
  });

  it('should allow selecting ADMIN role', async () => {
    const user = userEvent.setup();
    render(<InviteMemberModal isOpen={true} onInvite={mockOnInvite} onClose={mockOnClose} />);

    await user.selectOptions(screen.getByLabelText(/role/i), 'ADMIN');

    expect(screen.getByLabelText(/role/i)).toHaveValue('ADMIN');
  });

  it('should close modal on cancel', async () => {
    const user = userEvent.setup();
    render(<InviteMemberModal isOpen={true} onInvite={mockOnInvite} onClose={mockOnClose} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show success message after invitation sent', async () => {
    const user = userEvent.setup();
    mockOnInvite.mockResolvedValue({ success: true });

    render(<InviteMemberModal isOpen={true} onInvite={mockOnInvite} onClose={mockOnClose} />);

    await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
    await user.click(screen.getByRole('button', { name: /send invitation/i }));

    await waitFor(() => {
      expect(screen.getByText(/invitation sent successfully/i)).toBeInTheDocument();
    });
  });

  it('should disable form during submission', async () => {
    const user = userEvent.setup();
    let resolveInvite: (value: any) => void;
    mockOnInvite.mockReturnValue(new Promise(resolve => { resolveInvite = resolve; }));

    render(<InviteMemberModal isOpen={true} onInvite={mockOnInvite} onClose={mockOnClose} />);

    await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
    await user.click(screen.getByRole('button', { name: /send invitation/i }));

    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();
  });
});

