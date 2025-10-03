import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskForm } from '@/components/tasks/TaskForm';

/**
 * Tests for TaskForm component
 * Based on: docs/specs/features/task-management.md - Create/Edit Task scenarios
 */
describe('TaskForm', () => {
  const mockOnSubmit = vi.fn();

  it('should render create task form', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
  });

  it('should create task with valid data', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue({ id: '1' });

    render(<TaskForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/title/i), 'New Task');
    await user.type(screen.getByLabelText(/description/i), 'Task description');
    await user.selectOptions(screen.getByLabelText(/priority/i), 'HIGH');
    await user.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'Task description',
        priority: 'HIGH'
      });
    });
  });

  it('should validate required title', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    await user.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should populate form for editing existing task', () => {
    const existingTask = {
      id: '1',
      title: 'Existing Task',
      description: 'Existing description',
      priority: 'MEDIUM'
    };

    render(<TaskForm task={existingTask} onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/title/i)).toHaveValue('Existing Task');
    expect(screen.getByLabelText(/description/i)).toHaveValue('Existing description');
    expect(screen.getByRole('button', { name: /update task/i })).toBeInTheDocument();
  });

  it('should update existing task', async () => {
    const user = userEvent.setup();
    const existingTask = {
      id: '1',
      title: 'Old Title',
      description: 'Old description',
      priority: 'LOW'
    };

    render(<TaskForm task={existingTask} onSubmit={mockOnSubmit} />);

    await user.clear(screen.getByLabelText(/title/i));
    await user.type(screen.getByLabelText(/title/i), 'Updated Title');
    await user.selectOptions(screen.getByLabelText(/priority/i), 'HIGH');
    await user.click(screen.getByRole('button', { name: /update task/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        id: '1',
        title: 'Updated Title',
        description: 'Old description',
        priority: 'HIGH'
      });
    });
  });

  it('should show assignee selector', () => {
    const workspaceMembers = [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
    ];

    render(<TaskForm onSubmit={mockOnSubmit} workspaceMembers={workspaceMembers} />);

    expect(screen.getByLabelText(/assign to/i)).toBeInTheDocument();
  });

  it('should allow multiple assignees', async () => {
    const user = userEvent.setup();
    const workspaceMembers = [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
    ];

    render(<TaskForm onSubmit={mockOnSubmit} workspaceMembers={workspaceMembers} />);

    await user.click(screen.getByLabelText(/assign to/i));
    await user.click(screen.getByText('John Doe'));
    await user.click(screen.getByText('Jane Smith'));

    expect(screen.getByText('2 assignees selected')).toBeInTheDocument();
  });

  it('should validate title length', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const longTitle = 'a'.repeat(256);
    await user.type(screen.getByLabelText(/title/i), longTitle);
    await user.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(screen.getByText(/title must not exceed 255 characters/i)).toBeInTheDocument();
    });
  });

  it('should disable form during submission', async () => {
    const user = userEvent.setup();
    let resolveSubmit: (value: any) => void;
    mockOnSubmit.mockReturnValue(new Promise(resolve => { resolveSubmit = resolve; }));

    render(<TaskForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/title/i), 'New Task');
    await user.click(screen.getByRole('button', { name: /create task/i }));

    expect(screen.getByLabelText(/title/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled();
  });
});

