import Icon from "../ui/Icon";
import { useSettings, THEME_MODES } from "../../contexts/SettingsContext";

export default function Topbar({
  title,
  subtitle,
  onSearchClick,
  onMenuClick,
}) {
  const { settings, cycleThemeMode } = useSettings();

  const currentMode =
    THEME_MODES.find((m) => m.id === settings.themeMode) || THEME_MODES[2];

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-zinc-100 bg-white/80 px-4 py-4 backdrop-blur sm:px-6 lg:px-8 dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="flex min-w-0 items-center gap-2.5">
        <button
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          aria-label="Ẩn/hiện thanh điều hướng"
        >
          <Icon name="menu" size={22} />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-zinc-900 sm:text-xl dark:text-zinc-50">
            {title}
          </h1>
          {subtitle && (
            <p className="truncate text-xs text-zinc-400 sm:text-sm">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={onSearchClick}
          className="hidden items-center gap-2 rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-400 transition hover:border-zinc-300 sm:flex dark:border-zinc-700"
        >
          <Icon name="search" size={18} />
          <span>Tìm kiếm</span>
          <kbd className="rounded border border-zinc-200 px-1.5 py-0.5 text-[10px] font-semibold dark:border-zinc-600">
            Ctrl K
          </kbd>
        </button>
        <button
          onClick={onSearchClick}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 sm:hidden dark:border-zinc-700"
          aria-label="Tìm kiếm"
        >
          <Icon name="search" />
        </button>
        <button
          onClick={cycleThemeMode}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 transition hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-300"
          aria-label="Đổi giao diện sáng / tối / hệ thống"
          title={`Giao diện: ${currentMode.label} (chạm để đổi)`}
        >
          <Icon name={currentMode.icon} fill={currentMode.id !== "system"} />
        </button>
      </div>
    </header>
  );
}
