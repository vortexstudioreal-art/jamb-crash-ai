import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BackButton } from '../BackButton';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

import { useNavigate } from 'react-router-dom';

describe('BackButton', () => {
  it('renders the Back text', () => {
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    render(<BackButton />);
    expect(screen.getByText('Back')).toBeInTheDocument();
  });

  it('calls onClick when provided', () => {
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    const onClick = vi.fn();

    render(<BackButton onClick={onClick} />);
    fireEvent.click(screen.getByText('Back'));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('calls navigate(-1) when no onClick is provided', () => {
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    render(<BackButton />);
    fireEvent.click(screen.getByText('Back'));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('applies custom className', () => {
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    const { container } = render(<BackButton className="my-class" />);
    expect(container.firstChild).toHaveClass('my-class');
  });
});
