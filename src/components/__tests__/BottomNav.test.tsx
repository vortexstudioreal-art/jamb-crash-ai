import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BottomNav } from '../BottomNav';

vi.mock('framer-motion', () => ({
  motion: {
    span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement> & { layoutId?: string; transition?: unknown }) => (
      <span {...props}>{children}</span>
    ),
  },
}));

vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' '),
}));

describe('BottomNav', () => {
  it('renders all navigation items', () => {
    render(<BottomNav active="home" onChange={vi.fn()} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Study')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByText('Community')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('calls onChange with the correct tab id when a nav item is clicked', () => {
    const onChange = vi.fn();
    render(<BottomNav active="home" onChange={onChange} />);

    fireEvent.click(screen.getByText('Study'));
    expect(onChange).toHaveBeenCalledWith('study');
  });

  it('sets aria-current on the active tab', () => {
    render(<BottomNav active="ai" onChange={vi.fn()} />);

    const aiButton = screen.getByText('AI').closest('button');
    expect(aiButton).toHaveAttribute('aria-current', 'page');
  });

  it('does not set aria-current on inactive tabs', () => {
    render(<BottomNav active="home" onChange={vi.fn()} />);

    const studyButton = screen.getByText('Study').closest('button');
    expect(studyButton).not.toHaveAttribute('aria-current');
  });
});
