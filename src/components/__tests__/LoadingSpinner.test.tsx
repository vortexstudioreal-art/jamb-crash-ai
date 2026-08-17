import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default size (md)', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('renders with sm size', () => {
    render(<LoadingSpinner size="sm" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-4', 'h-4');
  });

  it('renders with lg size', () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-12', 'h-12');
  });

  it('has accessible aria-label', () => {
    render(<LoadingSpinner />);
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="my-custom" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('my-custom');
  });
});
