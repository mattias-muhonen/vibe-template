import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FilterBar } from '@/components/filters/FilterBar';

/**
 * Tests for FilterBar component
 * Based on: docs/specs/features/task-filters-sorting.md
 */
describe('FilterBar', () => {
  const mockOnFilterChange = vi.fn();
  const mockOnClearFilters = vi.fn();

  it('should render all filter options', () => {
    render(<FilterBar onFilterChange={mockOnFilterChange} />);

    expect(screen.getByText(/assignee/i)).toBeInTheDocument();
    expect(screen.getByText(/status/i)).toBeInTheDocument();
    expect(screen.getByText(/priority/i)).toBeInTheDocument();
    expect(screen.getByText(/due date/i)).toBeInTheDocument();
  });

  it('should apply assignee filter', async () => {
    const user = userEvent.setup();
    render(<FilterBar onFilterChange={mockOnFilterChange} />);

    await user.click(screen.getByText(/assignee/i));
    await user.click(screen.getByText(/me/i));

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        assignee: 'me'
      });
    });
  });

  it('should apply status filter', async () => {
    const user = userEvent.setup();
    render(<FilterBar onFilterChange={mockOnFilterChange} />);

    await user.click(screen.getByText(/status/i));
    await user.click(screen.getByText(/in progress/i));

    expect(mockOnFilterChange).toHaveBeenCalledWith({
        status: 'IN_PROGRESS'
      });
  });

  it('should apply multiple filters', async () => {
    const user = userEvent.setup();
    render(<FilterBar onFilterChange={mockOnFilterChange} />);

    await user.click(screen.getByText(/assignee/i));
    await user.click(screen.getByText(/me/i));

    await user.click(screen.getByText(/priority/i));
    await user.click(screen.getByText(/high/i));

    expect(mockOnFilterChange).toHaveBeenLastCalledWith({
      assignee: 'me',
      priority: 'HIGH'
    });
  });

  it('should show active filter count', async () => {
    const user = userEvent.setup();
    render(<FilterBar onFilterChange={mockOnFilterChange} />);

    await user.click(screen.getByText(/assignee/i));
    await user.click(screen.getByText(/me/i));

    await user.click(screen.getByText(/status/i));
    await user.click(screen.getByText(/todo/i));

    expect(screen.getByText('2 filters active')).toBeInTheDocument();
  });

  it('should clear all filters', async () => {
    const user = userEvent.setup();
    render(<FilterBar onFilterChange={mockOnFilterChange} onClearFilters={mockOnClearFilters} />);

    // Apply some filters first
    await user.click(screen.getByText(/assignee/i));
    await user.click(screen.getByText(/me/i));

    // Clear all
    await user.click(screen.getByText(/clear all/i));

    expect(mockOnClearFilters).toHaveBeenCalled();
  });

  it('should display filter chips for active filters', async () => {
    const user = userEvent.setup();
    render(<FilterBar onFilterChange={mockOnFilterChange} />);

    await user.click(screen.getByText(/assignee/i));
    await user.click(screen.getByText(/me/i));

    expect(screen.getByText(/assignee: me/i)).toBeInTheDocument();
  });

  it('should remove individual filter chip', async () => {
    const user = userEvent.setup();
    render(<FilterBar onFilterChange={mockOnFilterChange} />);

    await user.click(screen.getByText(/assignee/i));
    await user.click(screen.getByText(/me/i));

    const chip = screen.getByText(/assignee: me/i);
    const removeButton = chip.parentElement?.querySelector('button');
    
    if (removeButton) {
      await user.click(removeButton);
      expect(mockOnFilterChange).toHaveBeenCalledWith({ assignee: undefined });
    }
  });

  it('should persist filters in URL', async () => {
    const user = userEvent.setup();
    render(<FilterBar onFilterChange={mockOnFilterChange} />);

    await user.click(screen.getByText(/status/i));
    await user.click(screen.getByText(/completed/i));

    // Would verify URL params contain filter=status:completed
    expect(window.location.search).toContain('status=COMPLETED');
  });

  it('should load filters from URL on mount', () => {
    // Mock URL params
    window.history.pushState({}, '', '?assignee=me&status=TODO');
    
    render(<FilterBar onFilterChange={mockOnFilterChange} />);

    expect(screen.getByText(/assignee: me/i)).toBeInTheDocument();
    expect(screen.getByText(/status: todo/i)).toBeInTheDocument();
  });
});

