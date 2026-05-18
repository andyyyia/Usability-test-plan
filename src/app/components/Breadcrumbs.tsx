import { ChevronRight, Home } from 'lucide-react';
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
    <nav aria-label="Breadcrumb" className="mb-6 flex items-center text-sm font-medium">
      <ol className="flex items-center flex-wrap gap-1 md:gap-2">
        <li className="flex items-center">
          <NavLink 
            to="/" 
            className="text-gray-500 hover:text-[#1E3A5F] transition-colors p-1.5 rounded-md hover:bg-gray-100 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
          >
            <Home className="w-4 h-4" />
            <span className="sr-only">Home</span>
          </NavLink>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1 flex-shrink-0" />
              {item.to && !isLast ? (
                <NavLink 
                  to={item.to} 
                  className="text-gray-600 hover:text-[#1E3A5F] transition-colors hover:underline focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] rounded-sm px-1"
                >
                  {item.label}
                </NavLink>
              ) : (
                <span 
                  className={`px-2 py-1 rounded-md text-sm ${
                    isLast ? 'text-[#1E3A5F] bg-blue-50/80 font-bold border border-blue-100/50 shadow-sm' : 'text-gray-700'
                  }`}
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
