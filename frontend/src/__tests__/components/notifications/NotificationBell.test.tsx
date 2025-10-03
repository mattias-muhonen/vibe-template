import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { NotificationBell } from '@/components/notifications/NotificationBell';

/**
 * Tests for NotificationBell component
 * Based on: docs/specs/features/notifications.md
 */
describe('NotificationBell', () => {
  const mockNotifications = [
    {
      id: '1',
      title: 'Task assigned',
      body: 'You were assigned to "Deploy to staging"',
      isRead: false,
      createdAt: '2025-10-03T12:00:00Z'
    },
    {
      id: '2',
      title: 'Task completed',
      body: 'John completed "Review PR #123"',
      isRead: true,
      createdAt: '2025-10-03T11:00:00Z'
    }
  ];

  it('should display unread count badge', () => {
    render(<NotificationBell notifications={mockNotifications} />);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should not show badge when no unread notifications', () => {
    const readNotifications = mockNotifications.map(n => ({ ...n, isRead: true }));
    render(<NotificationBell notifications={readNotifications} />);

    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('should open dropdown on click', async () => {
    const user = userEvent.setup();
    render(<NotificationBell notifications={mockNotifications} />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByText('Task assigned')).toBeInTheDocument();
    expect(screen.getByText('Task completed')).toBeInTheDocument();
  });

  it('should mark notification as read on click', async () => {
    const user = userEvent.setup();
    const mockOnMarkAsRead = vi.fn();
    
    render(
      <NotificationBell 
        notifications={mockNotifications}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Task assigned'));

    expect(mockOnMarkAsRead).toHaveBeenCalledWith('1');
  });

  it('should navigate to task on notification click', async () => {
    const user = userEvent.setup();
    const mockOnNotificationClick = vi.fn();
    
    render(
      <NotificationBell 
        notifications={mockNotifications}
        onNotificationClick={mockOnNotificationClick}
      />
    );

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Task assigned'));

    expect(mockOnNotificationClick).toHaveBeenCalledWith(mockNotifications[0]);
  });

  it('should display "Clear all" button', async () => {
    const user = userEvent.setup();
    render(<NotificationBell notifications={mockNotifications} />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByText(/clear all/i)).toBeInTheDocument();
  });

  it('should clear all read notifications', async () => {
    const user = userEvent.setup();
    const mockOnClearAll = vi.fn();
    
    render(
      <NotificationBell 
        notifications={mockNotifications}
        onClearAll={mockOnClearAll}
      />
    );

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText(/clear all/i));

    expect(mockOnClearAll).toHaveBeenCalled();
  });

  it('should show empty state when no notifications', async () => {
    const user = userEvent.setup();
    render(<NotificationBell notifications={[]} />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByText(/no notifications/i)).toBeInTheDocument();
  });

  it('should display loading state', () => {
    render(<NotificationBell notifications={[]} isLoading={true} />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should update count when receiving new notifications', () => {
    const { rerender } = render(<NotificationBell notifications={mockNotifications} />);

    expect(screen.getByText('1')).toBeInTheDocument();

    const newNotifications = [
      ...mockNotifications,
      {
        id: '3',
        title: 'New notification',
        body: 'Another task assigned',
        isRead: false,
        createdAt: '2025-10-03T13:00:00Z'
      }
    ];

    rerender(<NotificationBell notifications={newNotifications} />);

    expect(screen.getByText('2')).toBeInTheDocument();
  });
});

