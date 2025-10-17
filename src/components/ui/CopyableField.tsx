'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyableFieldProps {
  label: string;
  value: string;
  className?: string;
  textClassName?: string;
}

export function CopyableField({ label, value, className = '', textClassName = '' }: CopyableFieldProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg border ${className}`}>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
        <p className={`text-sm text-gray-900 ${textClassName}`}>{value}</p>
      </div>
      <button
        onClick={handleCopy}
        className="ml-3 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        title="Copy to clipboard"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
