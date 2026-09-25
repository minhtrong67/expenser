import Icon from './ui/Icon';
import TextInput from './ui/TextInput';

export default function TransactionFilters({ filters, setFilters, categories, wallets, onReset }) {
  function set(patch) {
    setFilters((f) => ({ ...f, ...patch }));
  }

  const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  const sortedWallets = [...wallets].sort((a, b) => a.name.localeCompare(b.name, 'vi'));

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-3">
        <div className="w-full min-w-0">
          <TextInput
            icon="search"
            placeholder="Tìm theo ghi chú hoặc danh mục..."
            value={filters.search}
            onChange={(e) => set({ search: e.target.value })}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={filters.type}
            onChange={(e) => set({ type: e.target.value })}
            className="min-w-0 flex-1 basis-[140px] rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm text-zinc-700 outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <option value="all">Tất cả loại</option>
            <option value="income">Thu nhập</option>
            <option value="expense">Chi tiêu</option>
            <option value="transfer">Chuyển khoản</option>
          </select>
          <select
            value={filters.categoryId}
            onChange={(e) => set({ categoryId: e.target.value })}
            className="min-w-0 flex-1 basis-[160px] rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm text-zinc-700 outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <option value="all">Tất cả danh mục</option>
            {sortedCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={filters.walletId}
            onChange={(e) => set({ walletId: e.target.value })}
            className="min-w-0 flex-1 basis-[140px] rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm text-zinc-700 outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <option value="all">Tất cả ví</option>
            {sortedWallets.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-xs font-medium text-zinc-400">Từ ngày</span>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => set({ dateFrom: e.target.value })}
              className="w-full min-w-0 rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm text-zinc-700 outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-xs font-medium text-zinc-400">Đến ngày</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => set({ dateTo: e.target.value })}
              className="w-full min-w-0 rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm text-zinc-700 outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            />
          </label>
        </div>
      </div>

      <button onClick={onReset} className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-accent-600">
        <Icon name="filter_alt_off" size={15} /> Đặt lại về tháng này
      </button>
    </div>
  );
}
