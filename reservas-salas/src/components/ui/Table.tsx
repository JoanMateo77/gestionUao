import { HTMLAttributes, TableHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

interface TableProps extends HTMLAttributes<HTMLDivElement> {
  stickyHeader?: boolean;
  tableClassName?: string;
  tableProps?: TableHTMLAttributes<HTMLTableElement>;
  children: ReactNode;
}

export function Table({
  stickyHeader = false,
  className,
  tableClassName,
  tableProps,
  children,
  ...rest
}: TableProps) {
  return (
    <div
      className={cn(
        'w-full overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg-card)]',
        className,
      )}
      {...rest}
    >
      <table
        {...tableProps}
        className={cn(
          'w-full border-collapse text-sm',
          stickyHeader && '[&>thead>tr>th]:sticky [&>thead>tr>th]:top-0 [&>thead>tr>th]:z-10',
          tableClassName,
        )}
      >
        {children}
      </table>
    </div>
  );
}
