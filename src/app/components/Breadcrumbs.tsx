import { IconChevronRight, IconHome } from '@tabler/icons-react';
import { NavLink } from 'react-router';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className="flex items-center font-medium" 
      style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}
    >
      <ol className="flex items-center flex-wrap gap-1 md:gap-2">
        <li className="flex items-center">
          <NavLink 
            to="/" 
            className="transition-colors p-1.5 rounded-md hover:bg-[var(--color-bg-secondary)] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <IconHome size={16} />
            <span className="sr-only">Home</span>
          </NavLink>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center">
              <IconChevronRight size={16} className="mx-1 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
              {item.to && !isLast ? (
                <NavLink 
                  to={item.to} 
                  className="transition-colors hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded-sm px-1"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {item.label}
                </NavLink>
              ) : (
                <span 
                  className="px-2 py-1 rounded-md"
                  style={{
                    color: isLast ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    fontWeight: isLast ? 'var(--weight-bold)' : 'normal',
                    backgroundColor: isLast ? 'var(--color-primary-light)' : 'transparent',
                    border: isLast ? '1px solid var(--color-border-strong)' : 'none'
                  }}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
