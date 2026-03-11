'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
}

export function Logo({ className, size = 'md', showWordmark = true }: LogoProps) {
  const sizes = {
    sm: { mark: 20, text: 'text-lg' },
    md: { mark: 24, text: 'text-xl' },
    lg: { mark: 32, text: 'text-2xl' },
  };

  const { mark, text } = sizes[size];

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      {/* Minimal S mark */}
      <div 
        className="flex items-center justify-center rounded-lg bg-raised"
        style={{ width: mark, height: mark }}
      >
        <svg
          width={mark * 0.6}
          height={mark * 0.6}
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 4C3 3.44772 3.44772 3 4 3H7C7.55228 3 8 3.44772 8 4V5.5C8 6.05228 7.55228 6.5 7 6.5H4.5C3.94772 6.5 3.5 6.94772 3.5 7.5V9C3.5 9.55228 3.94772 10 4.5 10H10C10.5523 10 11 9.55228 11 9V8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="text-secondary-custom"
          />
        </svg>
      </div>
      
      {/* Wordmark */}
      {showWordmark && (
        <span className={cn('font-semibold tracking-tight text-primary-custom', text)}>
          SamsNotes
        </span>
      )}
    </div>
  );
}
