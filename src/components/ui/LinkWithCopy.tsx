'use client';

import { useState, ReactNode } from 'react';
import { Copy, Check } from 'lucide-react';

interface LinkWithCopyProps {
  url: string;
  label?: string;
  icon?: ReactNode;
  className?: string;
  linkClassName?: string;
  iconClassName?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function LinkWithCopy({
  url,
  label,
  icon,
  className = '',
  linkClassName = '',
  iconClassName = 'h-4 w-4',
  onClick,
}: LinkWithCopyProps) {
  const [copied, setCopied] = useState(false);

  const doCopy = async () => {
    try {
      const resolvedUrl = url.startsWith('http') ? url : `https://${url}`;
      await navigator.clipboard.writeText(resolvedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    doCopy();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      doCopy();
    }
  };

  const resolvedUrl = url.startsWith('http') ? url : `https://${url}`;

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <a
        href={resolvedUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={linkClassName || 'hover:underline'}
      >
        {icon ?? (label ?? url.replace(/^https?:\/\//, ''))}
      </a>
      <span
        role="button"
        tabIndex={0}
        onClick={handleCopy}
        onKeyDown={handleKeyDown}
        className="p-0.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors shrink-0 cursor-pointer"
        title="Copy link"
      >
        {copied ? (
          <Check className={`${iconClassName} text-green-600`} />
        ) : (
          <Copy className={iconClassName} />
        )}
      </span>
    </span>
  );
}
