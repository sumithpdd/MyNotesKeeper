'use client';

/**
 * Reusable colored badge for categorizing items (e.g., Customer, Lead, Active).
 * Use for type/status indicators across Entity Management, Customer cards, etc.
 *
 * @example
 * <TypeBadge label="Customer" variant="purple" />
 * <TypeBadge label="Active" variant="green" />
 */
interface TypeBadgeProps {
  label: string;
  variant?: 'purple' | 'blue' | 'green' | 'red' | 'amber' | 'orange' | 'teal' | 'gray';
  className?: string;
}

const variantStyles: Record<NonNullable<TypeBadgeProps['variant']>, string> = {
  purple: 'bg-purple-100 text-purple-800',
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  amber: 'bg-amber-100 text-amber-800',
  orange: 'bg-orange-100 text-orange-800',
  teal: 'bg-teal-100 text-teal-800',
  gray: 'bg-gray-100 text-gray-700',
};

export function TypeBadge({ label, variant = 'gray', className = '' }: TypeBadgeProps) {
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {label}
    </span>
  );
}
