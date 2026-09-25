import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import toast from "react-hot-toast";
import Icon from "../components/ui/Icon";
import Emoji from "../components/ui/Emoji";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import SwipeableItem from "../components/ui/SwipeableItem";
import { TableSkeleton, CardSkeleton } from "../components/ui/Skeleton";
import TransactionFormModal from "../components/TransactionFormModal";
import TransactionFilters from "../components/TransactionFilters";
import CalendarView from "../components/CalendarView";
import { EmptyState } from "./Dashboard";
import { useData } from "../contexts/DataContext";
import {
  formatMoney,
  formatDayHeader,
  formatTime,
  dayKey,
  monthStartInput,
  monthEndInput,
  parseLocalDate,
  parseLocalDateEnd,
} from "../utils/format";
import { getCategoryEmoji } from "../utils/categoryEmoji";
import { ArrowDownUp, ArrowUpDown } from "lucide-react";

const VIEWS = [
  { id: "list", label: "Danh sách", icon: "receipt_long" },
  { id: "calendar", label: "Lịch", icon: "calendar_month" },
];

function defaultFilters() {
  return {
    search: "",
    type: "all",
    categoryId: "all",
    walletId: "all",
    dateFrom: monthStartInput(),
    dateTo: monthEndInput(),
  };
}

export default function TransactionsPage() {
  const {
    transactions,
    categories,
    wallets,
    stats,
    getCategory,
    getWallet,
    deleteTransaction,
    deleteTransactionsBulk,
    loading,
  } = useData();
  const { openAddTx } = useOutletContext();

  const [view, setView] = useState("list");
  const [filters, setFilters] = useState(defaultFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortDir, setSortDir] = useState("desc");
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [editingTx, setEditingTx] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [detailTarget, setDetailTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const defaults = defaultFilters();
  const activeFilterCount = Object.keys(defaults).filter(
    (k) => filters[k] !== defaults[k],
  ).length;

  const filtered = useMemo(() => {
    const fromDate = filters.dateFrom ? parseLocalDate(filters.dateFrom) : null;
    const toDate = filters.dateTo ? parseLocalDateEnd(filters.dateTo) : null;
    let list = transactions.filter((t) => {
      if (filters.type !== "all" && t.type !== filters.type) return false;
      if (filters.categoryId !== "all" && t.categoryId !== filters.categoryId)
        return false;
      if (
        filters.walletId !== "all" &&
        t.walletId !== filters.walletId &&
        t.fromWalletId !== filters.walletId &&
        t.toWalletId !== filters.walletId
      )
        return false;
      if (fromDate && t.date < fromDate) return false;
      if (toDate && t.date > toDate) return false;
      if (filters.search.trim()) {
        const q = filters.search.trim().toLowerCase();
        const catName = getCategory(t.categoryId)?.name?.toLowerCase() || "";
        if (!(t.note || "").toLowerCase().includes(q) && !catName.includes(q))
          return false;
      }
      return true;
    });
    list = [...list].sort((a, b) =>
      sortDir === "desc" ? b.date - a.date : a.date - b.date,
    );
    return list;
  }, [transactions, filters, sortDir, getCategory]);

  // Group the already-sorted list into day sections for the list view,
  // with each day's own income/expense totals for the section header.
  const groups = useMemo(() => {
    const map = new Map();
    filtered.forEach((t) => {
      const key = dayKey(t.date);
      if (!map.has(key))
        map.set(key, { date: t.date, items: [], income: 0, expense: 0 });
      const g = map.get(key);
      g.items.push(t);
      if (t.type === "income") g.income += t.amount;
      else if (t.type === "expense") g.expense += t.amount;
    });
    return Array.from(map.values());
  }, [filtered]);

  function toggleSelect(id) {
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectMode() {
    setSelectMode((m) => {
      if (m) setSelected(new Set());
      return !m;
    });
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteTransaction(deleteTarget);
      toast.success("Đã xóa giao dịch.");
      setDeleteTarget(null);
    } catch {
      toast.error("Không thể xóa giao dịch.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleBulkDelete() {
    const txs = filtered.filter((t) => selected.has(t.id));
    setBulkDeleting(true);
    try {
      await deleteTransactionsBulk(txs);
      toast.success(`Đã xóa ${txs.length} giao dịch.`);
      setSelected(new Set());
      setSelectMode(false);
      setBulkDeleteOpen(false);
    } catch {
      toast.error("Không thể xóa các giao dịch đã chọn.");
    } finally {
      setBulkDeleting(false);
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid grid-cols-2 gap-3">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm shadow-emerald-500/20">
                <Icon name="arrow_upward" size={20} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Thu tháng này
                </p>

                <p className="mt-0.5 text-base font-bold leading-tight tabular-nums text-emerald-800 sm:text-lg dark:text-emerald-300">
                  {formatMoney(stats.monthIncome)}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-rose-500/20 dark:bg-rose-500/10">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-white shadow-sm shadow-rose-500/20">
                <Icon name="arrow_downward" size={20} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                  Chi tháng này
                </p>

                <p className="mt-0.5 text-base font-bold leading-tight tabular-nums text-rose-800 sm:text-lg dark:text-rose-300">
                  {formatMoney(stats.monthExpense)}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid w-full grid-cols-2 gap-2 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800 sm:w-64">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-3 text-sm font-semibold transition ${
                view === v.id
                  ? "bg-white text-accent-700 shadow-sm dark:bg-zinc-900 dark:text-accent-400"
                  : "text-zinc-500"
              }`}
            >
              <Icon name={v.icon} size={17} /> {v.label}
            </button>
          ))}
        </div>
      </div>

      {view === "calendar" ? (
        <CalendarView />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFiltersOpen((o) => !o)}
              className={`flex flex-1 items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-sm font-semibold transition sm:w-auto sm:flex-none ${
                filtersOpen
                  ? "border-accent-500 bg-accent-50 text-accent-700 dark:bg-accent-500/10 dark:text-accent-400"
                  : "border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon name="tune" size={19} />
                Bộ lọc
                {activeFilterCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-600 px-1 text-[11px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </span>
              <Icon
                name="expand_more"
                size={20}
                className={`transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`}
              />
            </button>
            <button
              onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
              className="flex items-center gap-1.5 rounded-2xl border border-zinc-200 bg-white px-3.5 py-3.5 text-sm font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              aria-label="Đổi thứ tự sắp xếp"
              title="Đổi thứ tự sắp xếp theo ngày"
            >
              {sortDir === "desc" ? (
                <ArrowDownUp size={18} />
              ) : (
                <ArrowUpDown size={18} />
              )}

              {/* <Icon
                name={sortDir === "desc" ? "arrow-up-down" : "arrow-down-up"}
                size={18}
              /> */}
            </button>
            <button
              onClick={toggleSelectMode}
              className={`rounded-2xl border px-3.5 py-3.5 text-sm font-semibold transition ${
                selectMode
                  ? "border-accent-500 bg-accent-50 text-accent-700 dark:bg-accent-500/10 dark:text-accent-400"
                  : "border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              }`}
            >
              {selectMode ? "Xong" : "Chọn"}
            </button>
          </div>

          {filtersOpen && (
            <div className="animate-slide-up">
              <TransactionFilters
                filters={filters}
                setFilters={setFilters}
                categories={categories}
                wallets={wallets}
                onReset={() => setFilters(defaultFilters())}
              />
            </div>
          )}

          {selectMode && selected.size > 0 && (
            <div className="flex items-center justify-between rounded-xl bg-accent-50 px-4 py-3 text-sm text-accent-700 dark:bg-accent-500/10 dark:text-accent-400">
              <span>Đã chọn {selected.size} giao dịch</span>
              <button
                onClick={() => setBulkDeleteOpen(true)}
                className="font-semibold text-rose-500 hover:underline"
              >
                Xóa đã chọn
              </button>
            </div>
          )}

          {loading ? (
            <TableSkeleton />
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              {transactions.length > 0 ? (
                <EmptyState
                  icon="filter_alt_off"
                  text="Không có giao dịch nào phù hợp với bộ lọc hiện tại (mặc định chỉ hiển thị tháng này)."
                  action={{
                    label: "Xem tất cả giao dịch",
                    onClick: () => {
                      setFilters({
                        search: "",
                        type: "all",
                        categoryId: "all",
                        walletId: "all",
                        dateFrom: "",
                        dateTo: "",
                      });
                      setFiltersOpen(true);
                    },
                  }}
                />
              ) : (
                <EmptyState
                  icon="receipt_long"
                  text="Chưa có giao dịch nào."
                  action={{ label: "Thêm giao dịch mới", onClick: openAddTx }}
                />
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <p className="px-1 text-xs text-zinc-400">
                {selectMode
                  ? "Chạm vào giao dịch để chọn"
                  : "Vuốt phải để sửa · vuốt trái để xóa"}
              </p>
              {groups.map((group) => (
                <div key={dayKey(group.date)}>
                  <div className="mb-2 flex items-center justify-between gap-2 px-1">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                      {formatDayHeader(group.date)}
                    </h3>

                    {/* <div className="flex shrink-0 items-center gap-2 text-[11px] font-semibold tabular-nums">
                      {group.income > 0 && <span className="text-emerald-600">+{formatMoney(group.income)}</span>}
                      {group.expense > 0 && <span className="text-rose-500">-{formatMoney(group.expense)}</span>}
                    </div> */}

                    <div className="flex shrink-0 items-center gap-2 font-semibold tabular-nums">
                      {(group.income > 0 || group.expense > 0) && (
                        <span
                          className={
                            group.income - group.expense >= 0
                              ? "text-emerald-600"
                              : "text-rose-500"
                          }
                        >
                          {group.income - group.expense >= 0 ? "+" : "-"}
                          {formatMoney(Math.abs(group.income - group.expense))}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {group.items.map((t) => {
                      const cat = getCategory(t.categoryId);
                      const wallet = getWallet(t.walletId);
                      const isTransfer = t.type === "transfer";
                      const isSelected = selected.has(t.id);
                      return (
                        <SwipeableItem
                          key={t.id}
                          rounded="rounded-xl"
                          disabled={selectMode}
                          onEdit={
                            isTransfer
                              ? undefined
                              : () => {
                                  setEditingTx(t);
                                  setFormOpen(true);
                                }
                          }
                          onDelete={
                            isTransfer ? undefined : () => setDeleteTarget(t)
                          }
                          // onTap={() => {
                          //   if (selectMode) {
                          //     if (!isTransfer) toggleSelect(t.id);
                          //     return;
                          //   }
                          //   setDetailTarget(t);
                          // }}
                        >
                          <div
                            className={`flex items-center gap-3 rounded-xl border bg-white p-3.5 transition dark:bg-zinc-900 ${
                              isSelected
                                ? "border-accent-400 bg-accent-50/60 dark:bg-accent-500/10"
                                : "border-zinc-100 dark:border-zinc-800"
                            }`}
                          >
                            {selectMode && !isTransfer && (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                readOnly
                                className="h-4 w-4 shrink-0 rounded accent-accent-600"
                              />
                            )}
                            <span
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                              style={{
                                backgroundColor: `${cat?.color || "#64748B"}20`,
                                color: cat?.color || "#64748B",
                              }}
                            >
                              {isTransfer ? (
                                <Icon name="sync_alt" size={20} />
                              ) : (
                                <Emoji size={22}>{getCategoryEmoji(cat)}</Emoji>
                              )}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
                                {isTransfer
                                  ? "Chuyển khoản"
                                  : cat?.name || "Khác"}
                              </p>
                              <p className="truncate text-xs text-zinc-400">
                                {formatTime(t.date)} · {wallet?.name || ""}
                              </p>
                              {t.note && (
                                <p className="truncate text-xs text-zinc-400">
                                  {t.note}
                                </p>
                              )}
                            </div>
                            <span
                              className={`shrink-0 text-sm font-bold tabular-nums ${t.type === "income" ? "text-emerald-600" : t.type === "expense" ? "text-rose-500" : "text-zinc-600"}`}
                            >
                              {t.type === "income"
                                ? "+"
                                : t.type === "expense"
                                  ? "-"
                                  : ""}
                              {formatMoney(t.amount)}
                            </span>
                          </div>
                        </SwipeableItem>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <TransactionFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingTx(null);
        }}
        editingTx={editingTx}
      />

      <Modal
        open={!!detailTarget}
        onClose={() => setDetailTarget(null)}
        title="Chi tiết giao dịch"
        size="sm"
      >
        {detailTarget &&
          (() => {
            const cat = getCategory(detailTarget.categoryId);
            const wallet = getWallet(detailTarget.walletId);
            const isTransfer = detailTarget.type === "transfer";
            return (
              <div className="flex flex-col items-center gap-1 py-2 text-center">
                <span
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: `${cat?.color || "#64748B"}20`,
                    color: cat?.color || "#64748B",
                  }}
                >
                  {isTransfer ? (
                    <Icon name="sync_alt" size={28} />
                  ) : (
                    <Emoji size={32}>{getCategoryEmoji(cat)}</Emoji>
                  )}
                </span>
                <p
                  className={`mt-2 text-2xl font-extrabold tabular-nums ${detailTarget.type === "income" ? "text-emerald-600" : detailTarget.type === "expense" ? "text-rose-500" : "text-zinc-700 dark:text-zinc-200"}`}
                >
                  {detailTarget.type === "income"
                    ? "+"
                    : detailTarget.type === "expense"
                      ? "-"
                      : ""}
                  {formatMoney(detailTarget.amount)}
                </p>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  {isTransfer ? "Chuyển khoản" : cat?.name || "Khác"}
                </p>

                <div className="mt-4 w-full space-y-2.5 rounded-xl bg-zinc-50 p-4 text-left text-sm dark:bg-zinc-800/50">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-zinc-400">Ví</span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-200">
                      {wallet?.name || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-zinc-400">Thời gian</span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-200">
                      {formatDayHeader(detailTarget.date)},{" "}
                      {formatTime(detailTarget.date)}
                    </span>
                  </div>
                  {detailTarget.note && (
                    <div className="flex items-start justify-between gap-3">
                      <span className="shrink-0 text-zinc-400">Ghi chú</span>
                      <span className="text-right font-medium text-zinc-700 dark:text-zinc-200">
                        {detailTarget.note}
                      </span>
                    </div>
                  )}
                </div>

                {!isTransfer && (
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
                        setEditingTx(detailTarget);
                        setFormOpen(true);
                        setDetailTarget(null);
                      }}
                    >
                      Sửa
                    </Button>
                  </div>
                )}
              </div>
            );
          })()}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        danger
        confirmText="Xóa"
        message="Bạn có chắc muốn xóa giao dịch này? Số dư ví sẽ được cập nhật lại."
      />
      <ConfirmDialog
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        loading={bulkDeleting}
        danger
        confirmText="Xóa"
        message={`Bạn có chắc muốn xóa ${selected.size} giao dịch đã chọn?`}
      />
    </div>
  );
}
