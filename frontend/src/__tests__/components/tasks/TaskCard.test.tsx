import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskCard } from '@/components/tasks/TaskCard';

/**
 * Tests for TaskCard component
 * Based on: docs/specs/features/task-management.md
 */
describe('TaskCard', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    description: 'Task description',
    status: 'TODO',
    priority: 'HIGH',
    dueDate: '2025-12-31T23:59:59Z',
    createdBy: { id: 'user-1', name: 'John Doe' },
    assignees: [{ id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' }],
    createdAt: '2025-01-01T00:00:00Z'
  };

  it('should render task card with all details', () => {
    render(<TaskCard task={mockTask} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Task description')).toBeInTheDocument();
    expect(screen.getByText(/high/i)).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should show priority badge', () => {
    render(<TaskCard task={mockTask} />);

    const badge = screen.getByText(/high/i);
    expect(badge).toHaveClass('priority-high');
  });

  it('should mark task as complete on checkbox click', async () => {
    const user = userEvent.setup();
    const mockOnComplete = vi.fn();

    render(<TaskCard task={mockTask} onComplete={mockOnComplete} />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(mockOnComplete).toHaveBeenCalledWith('1');
  });

  it('should navigate to task detail on click', async () => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn();

    render(<TaskCard task={mockTask} onClick={mockOnClick} />);

    await user.click(screen.getByText('Test Task'));

    expect(mockOnClick).toHaveBeenCalledWith('1');
  });

  it('should show due date', () => {
    render(<TaskCard task={mockTask} />);

    expect(screen.getByText(/dec.*31.*2025/i)).toBeInTheDocument();
  });

  it('should highlight overdue tasks', () => {
    const overdueTask = {
      ...mockTask,
      dueDate: '2020-01-01T00:00:00Z'
    };

    render(<TaskCard task={overdueTask} />);

    expect(screen.getByText(/overdue/i)).toBeInTheDocument();
  });

  it('should show assignee avatars', () => {
    render(<TaskCard task={mockTask} />);

    const avatar = screen.getByAltText('Jane Smith');
    expect(avatar).toBeInTheDocument();
  });

  it('should show multiple assignees', () => {
    const taskWithMultipleAssignees = {
      ...mockTask,
      assignees: [
        { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' },
        { id: 'user-3', name: 'Bob Jones', email: 'bob@example.com' }
      ]
    };

    render(<TaskCard task={taskWithMultipleAssignees} />);

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
  });

  it('should show "Unassigned" when no assignees', () => {
    const unassignedTask = {
      ...mockTask,
      assignees: []
    };

    render(<TaskCard task={unassignedTask} />);

    expect(screen.getByText(/unassigned/i)).toBeInTheDocument();
  });

  it('should show task status', () => {
    render(<TaskCard task={mockTask} />);

    expect(screen.getByText(/todo/i)).toBeInTheDocument();
  });

  it('should apply completed style when task is completed', () => {
    const completedTask = {
      ...mockTask,
      status: 'COMPLETED'
    };

    const { container } = render(<TaskCard task={completedTask} />);

    expect(container.firstChild).toHaveClass('task-completed');
  });
});

