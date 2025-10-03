import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ActivityFeed } from '@/components/notifications/ActivityFeed';

/**
 * Tests for ActivityFeed component
 * Based on: docs/specs/features/notifications.md - Activity Feed scenario
 */
describe('ActivityFeed', () => {
  const mockActivities = [
    {
      id: '1',
      type: 'task_created',
      actor: { id: 'user-1', name: 'John Doe' },
      action: 'created task',
      entity: { type: 'task', id: 'task-1', name: 'Deploy to staging' },
      timestamp: '2025-10-03T12:00:00Z'
    },
    {
      id: '2',
      type: 'task_assigned',
      actor: { id: 'user-2', name: 'Jane Smith' },
      action: 'assigned task to',
      entity: { type: 'task', id: 'task-2', name: 'Review PR' },
      target: { id: 'user-3', name: 'Bob Jones' },
      timestamp: '2025-10-03T11:00:00Z'
    },
    {
      id: '3',
      type: 'member_joined',
      actor: { id: 'user-4', name: 'Alice Brown' },
      action: 'joined workspace',
      timestamp: '2025-10-02T10:00:00Z'
    }
  ];

  it('should display activity timeline', () => {
    render(<ActivityFeed activities={mockActivities} />);

    expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    expect(screen.getByText(/created task/i)).toBeInTheDocument();
    expect(screen.getByText(/deploy to staging/i)).toBeInTheDocument();
  });

  it('should group events by day', () => {
    render(<ActivityFeed activities={mockActivities} />);

    expect(screen.getByText(/october 3/i)).toBeInTheDocument();
    expect(screen.getByText(/october 2/i)).toBeInTheDocument();
  });

  it('should show event icons', () => {
    render(<ActivityFeed activities={mockActivities} />);

    const icons = screen.getAllByRole('img', { hidden: true });
    expect(icons.length).toBeGreaterThan(0);
  });

  it('should display actor and action', () => {
    render(<ActivityFeed activities={mockActivities} />);

    expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
    expect(screen.getByText(/assigned task to/i)).toBeInTheDocument();
  });

  it('should show timestamps', () => {
    render(<ActivityFeed activities={mockActivities} />);

    expect(screen.getByText(/12:00/i)).toBeInTheDocument();
    expect(screen.getByText(/11:00/i)).toBeInTheDocument();
  });

  it('should filter by event type', async () => {
    const user = userEvent.setup();
    render(<ActivityFeed activities={mockActivities} />);

    await user.click(screen.getByText(/filter/i));
    await user.click(screen.getByText(/task events/i));

    expect(screen.getByText(/deploy to staging/i)).toBeInTheDocument();
    expect(screen.queryByText(/joined workspace/i)).not.toBeInTheDocument();
  });

  it('should navigate to entity on click', async () => {
    const user = userEvent.setup();
    const mockOnEntityClick = vi.fn();

    render(<ActivityFeed activities={mockActivities} onEntityClick={mockOnEntityClick} />);

    await user.click(screen.getByText(/deploy to staging/i));

    expect(mockOnEntityClick).toHaveBeenCalledWith('task', 'task-1');
  });

  it('should paginate activities', async () => {
    const user = userEvent.setup();
    const manyActivities = Array.from({ length: 50 }, (_, i) => ({
      ...mockActivities[0],
      id: `activity-${i}`,
      timestamp: new Date(2025, 9, 3, 12 - i, 0).toISOString()
    }));

    render(<ActivityFeed activities={manyActivities} pageSize={20} />);

    expect(screen.getByText(/load more/i)).toBeInTheDocument();

    await user.click(screen.getByText(/load more/i));

    // More items should be visible
    await waitFor(() => {
      expect(screen.getAllByRole('article')).toHaveLength(40);
    });
  });

  it('should show empty state when no activities', () => {
    render(<ActivityFeed activities={[]} />);

    expect(screen.getByText(/no activity yet/i)).toBeInTheDocument();
  });

  it('should display loading state', () => {
    render(<ActivityFeed activities={[]} isLoading={true} />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should format different activity types correctly', () => {
    render(<ActivityFeed activities={mockActivities} />);

    // Task created
    expect(screen.getByText(/created task/i)).toBeInTheDocument();
    
    // Task assigned
    expect(screen.getByText(/assigned task to/i)).toBeInTheDocument();
    
    // Member joined
    expect(screen.getByText(/joined workspace/i)).toBeInTheDocument();
  });

  it('should show actor avatars', () => {
    render(<ActivityFeed activities={mockActivities} />);

    expect(screen.getByAltText(/john doe/i)).toBeInTheDocument();
    expect(screen.getByAltText(/jane smith/i)).toBeInTheDocument();
  });

  it('should handle real-time activity updates', async () => {
    const { rerender } = render(<ActivityFeed activities={mockActivities} />);

    const newActivity = {
      id: '4',
      type: 'task_completed',
      actor: { id: 'user-1', name: 'John Doe' },
      action: 'completed task',
      entity: { type: 'task', id: 'task-1', name: 'Deploy to staging' },
      timestamp: new Date().toISOString()
    };

    rerender(<ActivityFeed activities={[newActivity, ...mockActivities]} />);

    expect(screen.getByText(/completed task/i)).toBeInTheDocument();
  });
});

