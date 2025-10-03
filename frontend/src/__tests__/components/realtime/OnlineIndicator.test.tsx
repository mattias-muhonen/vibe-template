import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { OnlineIndicator } from '@/components/realtime/OnlineIndicator';

/**
 * Tests for OnlineIndicator component
 * Based on: docs/specs/features/real-time-collaboration.md - Online Presence
 */
describe('OnlineIndicator', () => {
  const mockOnlineUsers = [
    { id: 'user-1', name: 'John Doe', status: 'online' },
    { id: 'user-2', name: 'Jane Smith', status: 'online' },
    { id: 'user-3', name: 'Bob Jones', status: 'online' }
  ];

  it('should display online users count', () => {
    render(<OnlineIndicator users={mockOnlineUsers} />);

    expect(screen.getByText('3 members online')).toBeInTheDocument();
  });

  it('should show green dot for online status', () => {
    render(<OnlineIndicator users={mockOnlineUsers} />);

    const indicators = screen.getAllByRole('status');
    indicators.forEach(indicator => {
      expect(indicator).toHaveClass('status-online');
    });
  });

  it('should display list of online users', () => {
    render(<OnlineIndicator users={mockOnlineUsers} showUserList={true} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
  });

  it('should update when users come online', () => {
    const { rerender } = render(<OnlineIndicator users={mockOnlineUsers} />);

    expect(screen.getByText('3 members online')).toBeInTheDocument();

    const updatedUsers = [
      ...mockOnlineUsers,
      { id: 'user-4', name: 'Alice Brown', status: 'online' }
    ];

    rerender(<OnlineIndicator users={updatedUsers} />);

    expect(screen.getByText('4 members online')).toBeInTheDocument();
  });

  it('should update when users go offline', () => {
    const { rerender } = render(<OnlineIndicator users={mockOnlineUsers} />);

    expect(screen.getByText('3 members online')).toBeInTheDocument();

    const updatedUsers = mockOnlineUsers.slice(0, 2);

    rerender(<OnlineIndicator users={updatedUsers} />);

    expect(screen.getByText('2 members online')).toBeInTheDocument();
  });

  it('should show "No one online" when empty', () => {
    render(<OnlineIndicator users={[]} />);

    expect(screen.getByText(/no one online/i)).toBeInTheDocument();
  });

  it('should display user avatars', () => {
    render(<OnlineIndicator users={mockOnlineUsers} showUserList={true} />);

    expect(screen.getByAltText('John Doe')).toBeInTheDocument();
    expect(screen.getByAltText('Jane Smith')).toBeInTheDocument();
  });

  it('should show "1 member online" for singular', () => {
    const singleUser = [mockOnlineUsers[0]];
    render(<OnlineIndicator users={singleUser} />);

    expect(screen.getByText('1 member online')).toBeInTheDocument();
  });
});

