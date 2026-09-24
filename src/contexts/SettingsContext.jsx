import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const SettingsContext = createContext(null);

const FONT_SCALES = { sm: 0.9, md: 1, lg: 1.1, xl: 1.2 };

// Shared metadata for the 3 theme modes so any component (Topbar quick
// toggle, Settings page selector, etc.) can stay in sync without
// duplicating the icon/label mapping or the light -> dark -> system order.
export const THEME_MODES = [
  { id: "light", label: "Sáng", icon: "light_mode" },
  { id: "dark", label: "Tối", icon: "dark_mode" },
  { id: "system", label: "Hệ thống", icon: "brightness_auto" },
];

const DEFAULT_SETTINGS = {
  themeMode: "system", // light | dark | system
  fontSize: "md", // sm | md | lg | xl
};

function getSystemPrefersDark() {
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useLocalStorage(
    "qlct:settings",
    DEFAULT_SETTINGS,
  );
  const [systemDark, setSystemDark] = useState(getSystemPrefersDark());

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setSystemDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const isDark =
    settings.themeMode === "system"
      ? systemDark
      : settings.themeMode === "dark";

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
    root.style.setProperty(
      "--font-scale",
      String(FONT_SCALES[settings.fontSize] || 1),
    );
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", isDark ? "#09090b" : "#ffffff");
  }, [isDark, settings.fontSize]);

  const update = useCallback(
    (patch) => {
      setSettings((prev) => ({ ...prev, ...patch }));
    },
    [setSettings],
  );

  const cycleThemeMode = useCallback(() => {
    setSettings((prev) => {
      const order = THEME_MODES.map((m) => m.id);
      const next = order[(order.indexOf(prev.themeMode) + 1) % order.length];
      return { ...prev, themeMode: next };
    });
  }, [setSettings]);

  const resetSettings = useCallback(
    () => setSettings(DEFAULT_SETTINGS),
    [setSettings],
  );

  const value = useMemo(
    () => ({
      settings,
      update,
      cycleThemeMode,
      resetSettings,
      isDark,
      FONT_SCALES,
    }),
    [settings, update, cycleThemeMode, resetSettings, isDark],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
