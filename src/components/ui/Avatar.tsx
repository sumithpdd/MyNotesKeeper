'use client';

import type { ReactNode } from 'react';

/**
 * Reusable avatar component - displays initials or custom content (e.g., icon).
 * Use for contact cards, user headers, entity detail panels.
 *
 * @example
 * <Avatar name="John Doe" />  // Shows "JD"
 * <Avatar fallback={<UserIcon />} />  // Shows icon
 */
interface AvatarProps {
  /** Name to derive initials from (e.g., "John Doe" → "JD") */
  name?: string;
  /** Custom content when not using initials (e.g., icon for products) */
  fallback?: ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

const sizeClasses = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-16 h-16 text-xl',
  lg: 'w-24 h-24 text-2xl',
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';
}

export function Avatar({ name, fallback, size = 'md', className = '' }: AvatarProps) {
  const content = name ? getInitials(name) : fallback;

  return (
    <div
      className={`rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0 ${sizeClasses[size]} ${className}`}
    >
      {typeof content === 'string' ? (
        content
      ) : (
        <span className="[&>svg]:h-8 [&>svg]:w-8 [&>svg]:text-white">{content}</span>
      )}
    </div>
  );
}
