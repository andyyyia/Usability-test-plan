import { useEffect, useState } from 'react';

const STORAGE_KEY = 'darkMode';

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.classList.toggle('dark', darkMode);
    window.localStorage.setItem(STORAGE_KEY, darkMode ? 'true' : 'false');
  }, [darkMode]);

  return {
    darkMode,
    toggleDarkMode: () => setDarkMode((current) => !current),
  };
}
