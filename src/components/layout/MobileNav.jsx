import { NavLink } from 'react-router-dom';
import Icon from '../ui/Icon';
import { MOBILE_NAV_ITEMS } from './navConfig';

export default function MobileNav({ onAddClick }) {
  const left = MOBILE_NAV_ITEMS.slice(0, 2);
  const right = MOBILE_NAV_ITEMS.slice(2);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden dark:border-zinc-800 dark:bg-zinc-900/95">
      <div className="relative flex items-center justify-around px-2 py-2">
        {left.map((item) => (
          <NavItem key={item.to} item={item} />
        ))}

        <button
          onClick={onAddClick}
          className="relative -mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-accent-600 text-white shadow-lg shadow-accent-600/40 transition active:scale-95"
          aria-label="Thêm giao dịch"
        >
          <Icon name="add" size={28} />
        </button>

        {right.map((item) => (
          <NavItem key={item.to} item={item} />
        ))}
      </div>
    </nav>
  );
}

function NavItem({ item }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-[10px] font-medium transition ${
          isActive ? 'text-accent-600 dark:text-accent-400' : 'text-zinc-400'
        }`
      }
    >
      <Icon name={item.icon} size={22} />
      {item.label}
    </NavLink>
  );
}
