'use client';

/**
 * Subtle badge for roles, titles, versions, or secondary metadata.
 * Lighter than TypeBadge - use for non-primary categorization.
 *
 * @example
 * <TitleBadge>CEO</TitleBadge>
 * <TitleBadge>v2.0</TitleBadge>
 */
interface TitleBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function TitleBadge({ children, className = '' }: TitleBadgeProps) {
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium bg-sky-50 text-sky-700 ${className}`}
    >
      {children}
    </span>
  );
}
