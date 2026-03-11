// ============================================================
// useMediaQuery — Reactive CSS media query hook
// ============================================================
// Usage: const isMobile = useMediaQuery('(max-width: 768px)');

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const getMatches = () => {
    // Guard for SSR (Next.js)
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState<boolean>(getMatches);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern API
    mediaQuery.addEventListener('change', handleChange);
    // Sync initial value in case it changed between render and effect
    setMatches(mediaQuery.matches);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}
