import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MemberList } from '@/components/workspaces/MemberList';

/**
 * Tests for MemberList component
 * Based on: docs/specs/features/workspace-management.md
 */
describe('MemberList', () => {
  const mockMembers = [
    {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'ADMIN',
      joinedAt: '2025-01-01T00:00:00Z'
    },
    {
      id: 'user-2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'MEMBER',
      joinedAt: '2025-01-02T00:00:00Z'
    }
  ];

  it('should display list of workspace members', () => {
    render(<MemberList members={mockMembers} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('should show member roles', () => {
    render(<MemberList members={mockMembers} />);

    expect(screen.getByText(/admin/i)).toBeInTheDocument();
    expect(screen.getByText(/member/i)).toBeInTheDocument();
  });

  it('should filter members by role', async () => {
    const user = userEvent.setup();
    render(<MemberList members={mockMembers} />);

    await user.click(screen.getByText(/filter by role/i));
    await user.click(screen.getByText(/admin only/i));

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('should show empty state when no members', () => {
    render(<MemberList members={[]} />);

    expect(screen.getByText(/no members found/i)).toBeInTheDocument();
  });

  it('should display pending invitations', () => {
    const pendingInvitations = [
      {
        id: 'invite-1',
        email: 'newuser@example.com',
        role: 'MEMBER',
        status: 'PENDING',
        invitedAt: '2025-01-03T00:00:00Z'
      }
    ];

    render(<MemberList members={mockMembers} pendingInvitations={pendingInvitations} />);

    expect(screen.getByText('newuser@example.com')).toBeInTheDocument();
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
  });

  it('should show action buttons for admins', () => {
    render(<MemberList members={mockMembers} currentUserRole="ADMIN" />);

    expect(screen.getAllByText(/change role/i)).toHaveLength(mockMembers.length);
    expect(screen.getAllByText(/remove/i)).toHaveLength(mockMembers.length);
  });

  it('should not show action buttons for members', () => {
    render(<MemberList members={mockMembers} currentUserRole="MEMBER" />);

    expect(screen.queryByText(/change role/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/remove/i)).not.toBeInTheDocument();
  });

  it('should change member role', async () => {
    const user = userEvent.setup();
    const mockOnChangeRole = vi.fn();

    render(
      <MemberList
        members={mockMembers}
        currentUserRole="ADMIN"
        onChangeRole={mockOnChangeRole}
      />
    );

    const changeRoleButtons = screen.getAllByText(/change role/i);
    await user.click(changeRoleButtons[1]); // Jane's button

    await user.click(screen.getByText(/promote to admin/i));

    expect(mockOnChangeRole).toHaveBeenCalledWith('user-2', 'ADMIN');
  });

  it('should remove member', async () => {
    const user = userEvent.setup();
    const mockOnRemove = vi.fn();

    render(
      <MemberList
        members={mockMembers}
        currentUserRole="ADMIN"
        onRemoveMember={mockOnRemove}
      />
    );

    const removeButtons = screen.getAllByText(/remove/i);
    await user.click(removeButtons[1]);

    // Confirm dialog
    await user.click(screen.getByText(/confirm/i));

    expect(mockOnRemove).toHaveBeenCalledWith('user-2');
  });

  it('should prevent removing last admin', async () => {
    const user = userEvent.setup();
    const singleAdmin = [mockMembers[0]]; // Only John (admin)

    render(
      <MemberList
        members={singleAdmin}
        currentUserRole="ADMIN"
      />
    );

    const removeButton = screen.getByText(/remove/i);
    await user.click(removeButton);

    expect(screen.getByText(/cannot remove last admin/i)).toBeInTheDocument();
  });

  it('should show member join date', () => {
    render(<MemberList members={mockMembers} />);

    expect(screen.getByText(/joined.*jan.*1.*2025/i)).toBeInTheDocument();
  });

  it('should display member avatars', () => {
    render(<MemberList members={mockMembers} />);

    expect(screen.getByAltText('John Doe')).toBeInTheDocument();
    expect(screen.getByAltText('Jane Smith')).toBeInTheDocument();
  });
});

