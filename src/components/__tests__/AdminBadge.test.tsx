import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminBadge } from '../AdminBadge';

vi.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) => (
    <a href={to} {...props}>{children}</a>
  ),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

describe('AdminBadge', () => {
  it('renders nothing when role is null', () => {
    const { container } = render(<AdminBadge role={null} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when role is undefined', () => {
    const { container } = render(<AdminBadge />);
    expect(container.innerHTML).toBe('');
  });

  it('renders "Owner" label for owner role', () => {
    render(<AdminBadge role="owner" />);
    expect(screen.getByText('Owner')).toBeInTheDocument();
  });

  it('renders "Admin" label for admin role', () => {
    render(<AdminBadge role="admin" />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders "Collaborator" label for collaborator role', () => {
    render(<AdminBadge role="collaborator" />);
    expect(screen.getByText('Collaborator')).toBeInTheDocument();
  });

  it('wraps content in a link when linkToAdmin is true', () => {
    render(<AdminBadge role="admin" linkToAdmin />);
    const link = screen.getByText('Admin').closest('a');
    expect(link).toHaveAttribute('href', '/admin');
  });

  it('does not wrap content in a link by default', () => {
    render(<AdminBadge role="admin" />);
    expect(screen.getByText('Admin').closest('a')).toBeNull();
  });

  it('uses customTitle when provided', () => {
    render(<AdminBadge role="collaborator" customTitle="Quiz Master" />);
    expect(screen.getByText('Quiz Master')).toBeInTheDocument();
  });
});
