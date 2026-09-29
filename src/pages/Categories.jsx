import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import Icon from "../components/ui/Icon";
import Emoji from "../components/ui/Emoji";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import TextInput from "../components/ui/TextInput";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import SwipeableItem from "../components/ui/SwipeableItem";
import { TableSkeleton } from "../components/ui/Skeleton";
import CategoryFormModal from "../components/CategoryFormModal";
import { EmptyState } from "./Dashboard";
import { useData } from "../contexts/DataContext";
import { getCategoryEmoji } from "../utils/categoryEmoji";
import { formatMoney } from "../utils/format";

export default function CategoriesPage() {
  const { categories, transactions, deleteCategory, loading } = useData();
  const [tab, setTab] = useState("expense");
  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState("asc"); // 'asc' (A-Z) | 'desc' (Z-A)
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return categories
      .filter((c) => c.type === tab)
      .filter((c) => !q || c.name.toLowerCase().includes(q))
      .sort((a, b) =>
        sortDir === "asc"
          ? a.name.localeCompare(b.name, "vi")
          : b.name.localeCompare(a.name, "vi"),
      );
  }, [categories, tab, search, sortDir]);

  // Precompute usage stats once per transactions change instead of
  // re-scanning the full transaction list for every category card on
  // every render (O(n) x M cards -> O(n) total).
  const usageByCategory = useMemo(() => {
    const map = new Map();
    transactions.forEach((t) => {
      const entry = map.get(t.categoryId) || { count: 0, total: 0 };
      entry.count += 1;
      entry.total += t.amount;
      map.set(t.categoryId, entry);
    });
    return map;
  }, [transactions]);

  function usageCount(catId) {
    return usageByCategory.get(catId)?.count || 0;
  }

  function usageTotal(catId) {
    return usageByCategory.get(catId)?.total || 0;
  }

  async function handleDelete() {
    const used = usageCount(deleteTarget.id);
    if (used > 0) {
      toast.error(
        `Không thể xóa: danh mục đang được dùng trong ${used} giao dịch.`,
      );
      setDeleteTarget(null);
      return;
    }
    setDeleting(true);
    try {
      await deleteCategory(deleteTarget.id);
      toast.success("Đã xóa danh mục.");
      setDeleteTarget(null);
    } catch {
      toast.error("Không thể xóa danh mục.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid w-full grid-cols-2 gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
          <button
            onClick={() => setTab("expense")}
            className={`rounded-lg py-3 text-sm font-semibold w-full transition ${tab === "expense" ? "bg-white text-rose-600 shadow-sm dark:bg-zinc-900" : "text-zinc-500"}`}
          >
            Danh mục chi
          </button>
          <button
            onClick={() => setTab("income")}
            className={`rounded-lg py-3 text-sm font-semibold w-full transition ${tab === "income" ? "bg-white text-emerald-600 shadow-sm dark:bg-zinc-900" : "text-zinc-500"}`}
          >
            Danh mục thu
          </button>
        </div>
        <Button
          icon="add"
          className="w-full"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          Thêm danh mục mới
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <TextInput
            icon="search"
            placeholder="Tìm kiếm danh mục..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 transition hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-300"
          aria-label={
            sortDir === "asc"
              ? "Đang sắp xếp A-Z, chạm để đổi sang Z-A"
              : "Đang sắp xếp Z-A, chạm để đổi sang A-Z"
          }
          title={sortDir === "asc" ? "A-Z" : "Z-A"}
        >
          <Icon name={sortDir === "asc" ? "sort_az" : "sort_za"} size={19} />
        </button>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          {search.trim() ? (
            <EmptyState
              icon="search_off"
              text={`Không tìm thấy danh mục nào khớp với "${search.trim()}".`}
              action={{ label: "Xóa tìm kiếm", onClick: () => setSearch("") }}
            />
          ) : (
            <EmptyState
              icon="category"
              text="Chưa có danh mục nào."
              action={{
                label: "Thêm danh mục",
                onClick: () => setFormOpen(true),
              }}
            />
          )}
        </div>
      ) : (
        <>
          <p className="px-1 text-xs text-zinc-400">
            Vuốt phải để sửa · vuốt trái để xóa
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((c, idx) => (
              <SwipeableItem
                key={c.id}
                className="animate-slide-up"
                style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }}
                onEdit={() => {
                  setEditing(c);
                  setFormOpen(true);
                }}
                onDelete={() => setDeleteTarget(c)}
                // onTap={() => setDetailTarget(c)}
              >
                <div className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:shadow-black/20">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${c.color}20`, color: c.color }}
                  >
                    <Emoji size={24}>{getCategoryEmoji(c)}</Emoji>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                      {c.name}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {usageCount(c.id)} giao dịch
                    </p>
                  </div>
                </div>
              </SwipeableItem>
            ))}
          </div>
        </>
      )}

      <CategoryFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        editing={editing}
        defaultType={tab}
      />

      <Modal
        open={!!detailTarget}
        onClose={() => setDetailTarget(null)}
        title="Chi tiết danh mục"
        size="sm"
      >
        {detailTarget && (
          <div className="flex flex-col items-center gap-1 py-2 text-center">
            <span
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: `${detailTarget.color}20`,
                color: detailTarget.color,
              }}
            >
              <Emoji size={32}>{getCategoryEmoji(detailTarget)}</Emoji>
            </span>
            <p className="mt-2 text-base font-bold text-zinc-800 dark:text-zinc-100">
              {detailTarget.name}
            </p>
            <p className="text-xs text-zinc-400">
              {detailTarget.type === "income" ? "Danh mục thu" : "Danh mục chi"}
            </p>
            <div className="mt-4 grid w-full grid-cols-2 gap-3">
              <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
                <p className="text-xs text-zinc-400">Số giao dịch</p>
                <p className="mt-0.5 text-lg font-bold tabular-nums text-zinc-800 dark:text-zinc-100">
                  {usageCount(detailTarget.id)}
                </p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
                <p className="text-xs text-zinc-400">Tổng số tiền</p>
                <p className="mt-0.5 truncate text-lg font-bold tabular-nums text-zinc-800 dark:text-zinc-100">
                  {formatMoney(usageTotal(detailTarget.id))}
                </p>
              </div>
            </div>
            <div className="mt-5 flex w-full gap-3">
              <Button
                variant="outline-danger"
                icon="delete"
                className="flex-1"
                onClick={() => {
                  setDeleteTarget(detailTarget);
                  setDetailTarget(null);
                }}
              >
                Xóa
              </Button>
              <Button
                icon="edit"
                className="flex-1"
                onClick={() => {
                  setEditing(detailTarget);
                  setFormOpen(true);
                  setDetailTarget(null);
                }}
              >
                Sửa
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message={`Bạn có chắc muốn xóa danh mục "${deleteTarget?.name}"?`}
      />
    </div>
  );
}
