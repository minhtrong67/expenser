import { NavLink } from 'react-router-dom';
import Icon from '../ui/Icon';
import { NAV_ITEMS } from './navConfig';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar({ onAddClick, open, onClose }) {
  const { user, logout } = useAuth();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 animate-fade-in bg-zinc-900/40 backdrop-blur-sm lg:hidden dark:bg-zinc-950/60"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-zinc-100 bg-white transition-transform duration-200 ease-out sm:w-64 dark:border-zinc-800 dark:bg-zinc-900 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between gap-2.5 px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-600 text-white shadow-sm shadow-accent-600/30">
              <Icon name="account_balance_wallet" fill size={20} />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-zinc-900 dark:text-zinc-50">Expenser</p>
              <p className="text-[11px] text-zinc-400">Quản lý tài chính cá nhân</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 lg:hidden dark:hover:bg-zinc-800"
            aria-label="Đóng thanh điều hướng"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <button
          onClick={onAddClick}
          className="mx-4 mb-4 flex items-center justify-center gap-2 rounded-xl bg-accent-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-accent-600/30 transition hover:bg-accent-700 active:scale-[0.98]"
        >
          <Icon name="add" size={20} />
          Thêm giao dịch
        </button>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => window.innerWidth < 1024 && onClose?.()}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-accent-50 text-accent-700 dark:bg-accent-500/10 dark:text-accent-400'
                    : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800'
                }`
              }
            >
              <Icon name={item.icon} size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-zinc-100 p-3 dark:border-zinc-800">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-100 text-sm font-bold text-accent-700 dark:bg-accent-500/20 dark:text-accent-400">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                (user?.displayName || user?.email || '?')[0]?.toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                {user?.displayName || 'Người dùng'}
              </p>
              <p className="truncate text-xs text-zinc-400">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              title="Đăng xuất"
              className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-rose-500 dark:hover:bg-zinc-800"
            >
              <Icon name="logout" size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
