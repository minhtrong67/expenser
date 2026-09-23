import { Link } from 'react-router-dom';
import Icon from '../components/ui/Icon';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center dark:bg-zinc-950">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-50 text-accent-600 dark:bg-accent-500/10">
        <Icon name="search_off" size={32} />
      </span>
      <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Không tìm thấy trang</h1>
      <p className="text-sm text-zinc-400">Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
      <Link to="/" className="rounded-xl bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-700">
        Về trang chủ
      </Link>
    </div>
  );
}
