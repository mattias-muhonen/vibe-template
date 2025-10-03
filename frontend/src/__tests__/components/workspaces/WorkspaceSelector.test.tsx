import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { WorkspaceSelector } from '@/components/workspaces/WorkspaceSelector';

/**
 * Tests for WorkspaceSelector component
 * Based on: docs/specs/features/workspace-management.md - Switch Between Workspaces
 */
describe('WorkspaceSelector', () => {
  const mockWorkspaces = [
    { id: '1', name: 'Marketing Team', role: 'ADMIN' },
    { id: '2', name: 'Development Team', role: 'MEMBER' }
  ];

  const mockOnChange = vi.fn();

  it('should render workspace selector dropdown', () => {
    render(
      <WorkspaceSelector 
        workspaces={mockWorkspaces}
        currentWorkspaceId="1"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Marketing Team')).toBeInTheDocument();
  });

  it('should display list of workspaces on click', async () => {
    const user = userEvent.setup();
    render(
      <WorkspaceSelector 
        workspaces={mockWorkspaces}
        currentWorkspaceId="1"
        onChange={mockOnChange}
      />
    );

    await user.click(screen.getByRole('button'));

    expect(screen.getByText('Development Team')).toBeInTheDocument();
  });

  it('should switch workspace on selection', async () => {
    const user = userEvent.setup();
    render(
      <WorkspaceSelector 
        workspaces={mockWorkspaces}
        currentWorkspaceId="1"
        onChange={mockOnChange}
      />
    );

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Development Team'));

    expect(mockOnChange).toHaveBeenCalledWith('2');
  });

  it('should show current workspace indicator', () => {
    render(
      <WorkspaceSelector 
        workspaces={mockWorkspaces}
        currentWorkspaceId="1"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByRole('button')).toHaveAttribute('aria-label', expect.stringContaining('Marketing Team'));
  });

  it('should display user role badge', async () => {
    const user = userEvent.setup();
    render(
      <WorkspaceSelector 
        workspaces={mockWorkspaces}
        currentWorkspaceId="1"
        onChange={mockOnChange}
      />
    );

    await user.click(screen.getByRole('button'));

    expect(screen.getByText(/admin/i)).toBeInTheDocument();
    expect(screen.getByText(/member/i)).toBeInTheDocument();
  });

  it('should show create workspace option', async () => {
    const user = userEvent.setup();
    const mockOnCreate = vi.fn();
    
    render(
      <WorkspaceSelector 
        workspaces={mockWorkspaces}
        currentWorkspaceId="1"
        onChange={mockOnChange}
        onCreateWorkspace={mockOnCreate}
      />
    );

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText(/create new workspace/i));

    expect(mockOnCreate).toHaveBeenCalled();
  });

  it('should handle loading state', () => {
    render(
      <WorkspaceSelector 
        workspaces={[]}
        currentWorkspaceId=""
        onChange={mockOnChange}
        isLoading={true}
      />
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should handle empty workspace list', () => {
    render(
      <WorkspaceSelector 
        workspaces={[]}
        currentWorkspaceId=""
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText(/no workspaces/i)).toBeInTheDocument();
  });

  it('should be keyboard navigable', async () => {
    const user = userEvent.setup();
    render(
      <WorkspaceSelector 
        workspaces={mockWorkspaces}
        currentWorkspaceId="1"
        onChange={mockOnChange}
      />
    );

    const button = screen.getByRole('button');
    button.focus();
    
    // Open dropdown with Enter
    await user.keyboard('{Enter}');
    expect(screen.getByText('Development Team')).toBeVisible();

    // Navigate with arrows
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(mockOnChange).toHaveBeenCalled();
  });
});

