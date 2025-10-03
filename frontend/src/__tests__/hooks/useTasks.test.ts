import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTasks } from '@/hooks/useTasks';

/**
 * Tests for useTasks hook
 * Based on: docs/specs/features/task-management.md
 */
describe('useTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty tasks', () => {
    const { result } = renderHook(() => useTasks('workspace-1'));

    expect(result.current.tasks).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it('should fetch tasks for workspace', async () => {
    const { result } = renderHook(() => useTasks('workspace-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.tasks).toHaveLength(greaterThan(0));
  });

  it('should create a new task', async () => {
    const { result } = renderHook(() => useTasks('workspace-1'));

    await waitFor(async () => {
      await result.current.createTask({
        title: 'New Task',
        priority: 'HIGH'
      });
    });

    expect(result.current.tasks).toContainEqual(
      expect.objectContaining({ title: 'New Task' })
    );
  });

  it('should update an existing task', async () => {
    const { result } = renderHook(() => useTasks('workspace-1'));

    await waitFor(async () => {
      await result.current.updateTask('task-1', {
        title: 'Updated Task'
      });
    });

    const updatedTask = result.current.tasks.find(t => t.id === 'task-1');
    expect(updatedTask?.title).toBe('Updated Task');
  });

  it('should delete a task', async () => {
    const { result } = renderHook(() => useTasks('workspace-1'));

    const initialCount = result.current.tasks.length;

    await waitFor(async () => {
      await result.current.deleteTask('task-1');
    });

    expect(result.current.tasks).toHaveLength(initialCount - 1);
    expect(result.current.tasks.find(t => t.id === 'task-1')).toBeUndefined();
  });

  it('should filter tasks by status', async () => {
    const { result } = renderHook(() => useTasks('workspace-1'));

    await waitFor(() => {
      result.current.setFilter({ status: 'COMPLETED' });
    });

    result.current.tasks.forEach(task => {
      expect(task.status).toBe('COMPLETED');
    });
  });

  it('should filter tasks by assignee', async () => {
    const { result } = renderHook(() => useTasks('workspace-1'));

    await waitFor(() => {
      result.current.setFilter({ assignee: 'user-1' });
    });

    result.current.tasks.forEach(task => {
      expect(task.assignees).toContainEqual(
        expect.objectContaining({ id: 'user-1' })
      );
    });
  });

  it('should sort tasks by due date', async () => {
    const { result } = renderHook(() => useTasks('workspace-1'));

    await waitFor(() => {
      result.current.setSort('dueDate', 'asc');
    });

    for (let i = 0; i < result.current.tasks.length - 1; i++) {
      if (result.current.tasks[i].dueDate && result.current.tasks[i + 1].dueDate) {
        expect(result.current.tasks[i].dueDate).toBeLessThanOrEqual(
          result.current.tasks[i + 1].dueDate
        );
      }
    }
  });

  it('should handle real-time task updates', async () => {
    const { result } = renderHook(() => useTasks('workspace-1'));

    // Simulate WebSocket update
    const newTask = {
      id: 'new-task',
      title: 'Real-time Task',
      status: 'TODO'
    };

    await waitFor(() => {
      // This would be triggered by WebSocket
      result.current.handleRealtimeUpdate('task:created', newTask);
    });

    expect(result.current.tasks).toContainEqual(
      expect.objectContaining({ id: 'new-task' })
    );
  });

  it('should handle errors gracefully', async () => {
    const { result } = renderHook(() => useTasks('invalid-workspace'));

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.isLoading).toBe(false);
    });
  });
});

