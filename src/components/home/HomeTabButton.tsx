import type { LucideIcon } from 'lucide-react';

interface HomeTabButtonProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
  tabId?: string;
  ariaControls?: string;
}

export function HomeTabButton({
  icon: Icon,
  label,
  active,
  onClick,
  tabId,
  ariaControls,
}: HomeTabButtonProps) {
  return (
    <button
      type="button"
      id={tabId}
      role="tab"
      aria-selected={active}
      {...(ariaControls ? { 'aria-controls': ariaControls } : {})}
      onClick={onClick}
      className={`shrink-0 px-4 sm:px-5 py-2.5 text-sm font-semibold whitespace-nowrap rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9381FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
        active
          ? 'text-gray-900 bg-white shadow-[0_1px_4px_-1px_rgba(15,23,42,0.12),0_2px_12px_-4px_rgba(147,129,255,0.42)] ring-1 ring-[#9381FF]/35'
          : 'text-gray-600 hover:text-gray-900 hover:bg-white/65'
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 opacity-[0.92]" aria-hidden />
        <span>{label}</span>
      </div>
    </button>
  );
}
