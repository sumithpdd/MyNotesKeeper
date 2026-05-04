'use client';

import type { ComponentType, ReactNode } from 'react';

/**
 * Reusable key-value row for detail panels and cards.
 * Displays a label with optional icon and value.
 *
 * @example
 * <DetailRow label="Email" value="user@example.com" icon={Mail} />
 * <DetailRow label="Status" value={<TypeBadge label="Active" variant="green" />} />
 */
interface DetailRowProps {
  label: string;
  value: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  className?: string;
}

export function DetailRow({ label, value, icon: Icon, className = '' }: DetailRowProps) {
  return (
    <div className={`col-span-2 sm:col-span-1 ${className}`}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-center gap-2 text-sm text-gray-900">
        {Icon && <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />}
        {value}
      </div>
    </div>
  );
}
