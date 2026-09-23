import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const SettingsContext = createContext(null);

const FONT_SCALES = { sm: 0.9, md: 1, lg: 1.1, xl: 1.2 };

const DEFAULT_SETTINGS = {
  themeMode: 'system', // light | dark | system
  fontSize: 'md', // sm | md | lg | xl
};

function getSystemPrefersDark() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useLocalStorage('qlct:settings', DEFAULT_SETTINGS);
  const [systemDark, setSystemDark] = useState(getSystemPrefersDark());

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const isDark = settings.themeMode === 'system' ? systemDark : settings.themeMode === 'dark';

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    root.style.setProperty('--font-scale', String(FONT_SCALES[settings.fontSize] || 1));
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isDark ? '#09090b' : '#ffffff');
  }, [isDark, settings.fontSize]);

  const update = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, [setSettings]);

  const resetSettings = useCallback(() => setSettings(DEFAULT_SETTINGS), [setSettings]);

  const value = useMemo(
    () => ({
      settings,
      update,
      resetSettings,
      isDark,
      FONT_SCALES,
    }),
    [settings, update, resetSettings, isDark]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
