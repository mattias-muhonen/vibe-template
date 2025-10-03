import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useWorkspace } from '@/hooks/useWorkspace';

/**
 * Tests for useWorkspace hook
 * Based on: docs/specs/features/workspace-management.md
 */
describe('useWorkspace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch user workspaces', async () => {
    const { result } = renderHook(() => useWorkspace());

    await waitFor(() => {
      expect(result.current.workspaces).toHaveLength(greaterThan(0));
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should get current workspace', async () => {
    const { result } = renderHook(() => useWorkspace());

    await waitFor(() => {
      expect(result.current.currentWorkspace).toBeTruthy();
      expect(result.current.currentWorkspace?.id).toBeTruthy();
    });
  });

  it('should switch workspace', async () => {
    const { result } = renderHook(() => useWorkspace());

    await waitFor(async () => {
      await result.current.switchWorkspace('workspace-2');
    });

    expect(result.current.currentWorkspace?.id).toBe('workspace-2');
  });

  it('should create workspace', async () => {
    const { result } = renderHook(() => useWorkspace());

    await waitFor(async () => {
      await result.current.createWorkspace({
        name: 'New Workspace',
        description: 'Test workspace'
      });
    });

    expect(result.current.workspaces).toContainEqual(
      expect.objectContaining({ name: 'New Workspace' })
    );
  });

  it('should update workspace', async () => {
    const { result } = renderHook(() => useWorkspace());

    await waitFor(async () => {
      await result.current.updateWorkspace('workspace-1', {
        name: 'Updated Name'
      });
    });

    const workspace = result.current.workspaces.find(w => w.id === 'workspace-1');
    expect(workspace?.name).toBe('Updated Name');
  });

  it('should delete workspace', async () => {
    const { result } = renderHook(() => useWorkspace());

    const initialCount = result.current.workspaces.length;

    await waitFor(async () => {
      await result.current.deleteWorkspace('workspace-1');
    });

    expect(result.current.workspaces).toHaveLength(initialCount - 1);
  });

  it('should invite member to workspace', async () => {
    const { result } = renderHook(() => useWorkspace());

    await waitFor(async () => {
      await result.current.inviteMember('workspace-1', {
        email: 'newuser@example.com',
        role: 'MEMBER'
      });
    });

    // Verify invitation was sent
    expect(result.current.invitations).toContainEqual(
      expect.objectContaining({ email: 'newuser@example.com' })
    );
  });

  it('should remove member from workspace', async () => {
    const { result } = renderHook(() => useWorkspace());

    await waitFor(async () => {
      await result.current.removeMember('workspace-1', 'user-2');
    });

    const workspace = result.current.workspaces.find(w => w.id === 'workspace-1');
    expect(workspace?.members).not.toContainEqual(
      expect.objectContaining({ id: 'user-2' })
    );
  });

  it('should update member role', async () => {
    const { result } = renderHook(() => useWorkspace());

    await waitFor(async () => {
      await result.current.updateMemberRole('workspace-1', 'user-2', 'ADMIN');
    });

    const workspace = result.current.workspaces.find(w => w.id === 'workspace-1');
    const member = workspace?.members.find(m => m.id === 'user-2');
    expect(member?.role).toBe('ADMIN');
  });

  it('should handle errors gracefully', async () => {
    const { result } = renderHook(() => useWorkspace());

    await waitFor(async () => {
      try {
        await result.current.switchWorkspace('invalid-workspace-id');
      } catch (error) {
        expect(result.current.error).toBeTruthy();
      }
    });
  });

  it('should leave workspace', async () => {
    const { result } = renderHook(() => useWorkspace());

    const initialCount = result.current.workspaces.length;

    await waitFor(async () => {
      await result.current.leaveWorkspace('workspace-2');
    });

    expect(result.current.workspaces).toHaveLength(initialCount - 1);
  });
});

