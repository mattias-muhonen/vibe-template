import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taskApi } from '@/lib/api/tasks';

/**
 * Tests for Task API client
 * Based on: docs/specs/features/task-management.md
 */
describe('taskApi', () => {
  const mockToken = 'mock-auth-token';

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('createTask', () => {
    it('should create task with auth token', async () => {
      const mockTask = {
        id: '1',
        title: 'New Task',
        description: 'Description',
        status: 'TODO',
        priority: 'HIGH',
        workspaceId: 'workspace-1'
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockTask
      });

      const result = await taskApi.createTask({
        title: 'New Task',
        description: 'Description',
        priority: 'HIGH',
        workspaceId: 'workspace-1'
      }, mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/tasks',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-auth-token',
            'Content-Type': 'application/json'
          })
        })
      );

      expect(result).toEqual(mockTask);
    });
  });

  describe('getTasks', () => {
    it('should fetch tasks for workspace', async () => {
      const mockTasks = [
        { id: '1', title: 'Task 1', status: 'TODO' },
        { id: '2', title: 'Task 2', status: 'IN_PROGRESS' }
      ];

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ tasks: mockTasks })
      });

      const result = await taskApi.getTasks('workspace-1', mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/tasks?workspaceId=workspace-1'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-auth-token'
          })
        })
      );

      expect(result.tasks).toEqual(mockTasks);
    });

    it('should apply filters to task query', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ tasks: [] })
      });

      await taskApi.getTasks('workspace-1', mockToken, {
        status: 'TODO',
        assignee: 'me',
        priority: 'HIGH'
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=TODO'),
        expect.anything()
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('assignee=me'),
        expect.anything()
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('priority=HIGH'),
        expect.anything()
      );
    });
  });

  describe('updateTask', () => {
    it('should update task details', async () => {
      const updatedTask = {
        id: '1',
        title: 'Updated Task',
        priority: 'HIGH'
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => updatedTask
      });

      const result = await taskApi.updateTask('1', {
        title: 'Updated Task',
        priority: 'HIGH'
      }, mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/tasks/1',
        expect.objectContaining({
          method: 'PUT'
        })
      );

      expect(result).toEqual(updatedTask);
    });
  });

  describe('deleteTask', () => {
    it('should delete task by ID', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 204
      });

      await taskApi.deleteTask('1', mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/tasks/1',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-auth-token'
          })
        })
      );
    });
  });

  describe('assignTask', () => {
    it('should assign task to users', async () => {
      const assignedTask = {
        id: '1',
        assignees: [{ id: 'user-1', name: 'John Doe' }]
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => assignedTask
      });

      const result = await taskApi.assignTask('1', ['user-1'], mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/tasks/1/assign',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ userIds: ['user-1'] })
        })
      );

      expect(result.assignees).toHaveLength(1);
    });
  });

  describe('completeTask', () => {
    it('should mark task as complete', async () => {
      const completedTask = {
        id: '1',
        status: 'COMPLETED',
        completedAt: '2025-10-03T12:00:00Z'
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => completedTask
      });

      const result = await taskApi.completeTask('1', mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/tasks/1/complete',
        expect.objectContaining({
          method: 'POST'
        })
      );

      expect(result.status).toBe('COMPLETED');
    });
  });
});

