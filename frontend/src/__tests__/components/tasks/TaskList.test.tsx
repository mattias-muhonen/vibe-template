import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskList } from '@/components/tasks/TaskList';

/**
 * Tests for TaskList component
 * Based on: docs/specs/features/task-management.md
 */
describe('TaskList', () => {
  const mockTasks = [
    {
      id: '1',
      title: 'Task 1',
      description: 'Description 1',
      status: 'TODO',
      priority: 'HIGH',
      createdBy: 'user1',
      createdAt: '2025-01-01T00:00:00Z'
    },
    {
      id: '2',
      title: 'Task 2',
      description: 'Description 2',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      createdBy: 'user1',
      createdAt: '2025-01-02T00:00:00Z'
    }
  ];

  it('should render list of tasks', () => {
    render(<TaskList tasks={mockTasks} />);

    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('should display empty state when no tasks', () => {
    render(<TaskList tasks={[]} />);

    expect(screen.getByText(/no tasks found/i)).toBeInTheDocument();
  });

  it('should filter tasks by status', async () => {
    const user = userEvent.setup();
    render(<TaskList tasks={mockTasks} />);

    await user.click(screen.getByText(/filter/i));
    await user.click(screen.getByText(/in progress/i));

    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
  });

  it('should sort tasks by priority', async () => {
    const user = userEvent.setup();
    render(<TaskList tasks={mockTasks} />);

    await user.click(screen.getByText(/sort/i));
    await user.click(screen.getByText(/priority/i));

    const tasks = screen.getAllByRole('article');
    expect(tasks[0]).toHaveTextContent('Task 1'); // HIGH priority first
  });

  it('should mark task as complete', async () => {
    const user = userEvent.setup();
    const mockOnComplete = vi.fn();
    render(<TaskList tasks={mockTasks} onTaskComplete={mockOnComplete} />);

    const checkbox = screen.getAllByRole('checkbox')[0];
    await user.click(checkbox);

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith('1');
    });
  });

  it('should navigate to task detail on click', async () => {
    const user = userEvent.setup();
    const mockOnTaskClick = vi.fn();
    render(<TaskList tasks={mockTasks} onTaskClick={mockOnTaskClick} />);

    await user.click(screen.getByText('Task 1'));

    expect(mockOnTaskClick).toHaveBeenCalledWith('1');
  });

  it('should show task priority badges', () => {
    render(<TaskList tasks={mockTasks} />);

    expect(screen.getByText(/high/i)).toBeInTheDocument();
    expect(screen.getByText(/medium/i)).toBeInTheDocument();
  });

  it('should show task assignees', () => {
    const tasksWithAssignees = [
      {
        ...mockTasks[0],
        assignees: [{ id: '1', name: 'John Doe', email: 'john@example.com' }]
      }
    ];

    render(<TaskList tasks={tasksWithAssignees} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    render(<TaskList tasks={[]} isLoading={true} />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should handle error state', () => {
    render(<TaskList tasks={[]} error="Failed to load tasks" />);

    expect(screen.getByText(/failed to load tasks/i)).toBeInTheDocument();
  });
});

