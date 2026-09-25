import { useState } from "react";
import toast from "react-hot-toast";
import Icon from "../components/ui/Icon";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import SwipeableItem from "../components/ui/SwipeableItem";
import { CardSkeleton } from "../components/ui/Skeleton";
import WalletFormModal from "../components/WalletFormModal";
import TransferModal from "../components/TransferModal";
import { EmptyState } from "./Dashboard";
import { useData } from "../contexts/DataContext";
import { formatMoney } from "../utils/format";

export default function WalletsPage() {
  const { wallets, transactions, deleteWallet, loading } = useData();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const total = wallets.reduce((s, w) => s + (Number(w.balance) || 0), 0);

  function usageCount(walletId) {
    return transactions.filter(
      (t) =>
        t.walletId === walletId ||
        t.fromWalletId === walletId ||
        t.toWalletId === walletId,
    ).length;
  }

  async function handleDelete() {
    const used = usageCount(deleteTarget.id);
    if (used > 0) {
      toast.error(`Không thể xóa: ví đang được dùng trong ${used} giao dịch.`);
      setDeleteTarget(null);
      return;
    }
    if (wallets.length <= 1) {
      toast.error("Bạn cần giữ lại ít nhất một ví.");
      setDeleteTarget(null);
      return;
    }
    setDeleting(true);
    try {
      await deleteWallet(deleteTarget.id);
      toast.success("Đã xóa ví.");
      setDeleteTarget(null);
    } catch {
      toast.error("Không thể xóa ví.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <p className="text-xs font-medium text-zinc-400">
            Tổng số dư tất cả ví
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
            {formatMoney(total)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            icon="sync_alt"
            onClick={() => setTransferOpen(true)}
            disabled={wallets.length < 2}
          >
            Chuyển tiền
          </Button>
          <Button
            size="sm"
            icon="add"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Thêm ví
          </Button>
        </div>
      </div>

      {wallets.length === 0 ? (
        <div className="rounded-2xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <EmptyState
            icon="account_balance_wallet"
            text="Chưa có ví nào."
            action={{
              label: "Thêm ví đầu tiên",
              onClick: () => setFormOpen(true),
            }}
          />
        </div>
      ) : (
        <>
          <p className="px-1 text-xs text-zinc-400">
            Vuốt phải để sửa · vuốt trái để xóa
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {wallets.map((w, idx) => (
              <SwipeableItem
                key={w.id}
                className="animate-slide-up"
                style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }}
                onEdit={() => {
                  setEditing(w);
                  setFormOpen(true);
                }}
                onDelete={() => setDeleteTarget(w)}
                // onTap={() => setDetailTarget(w)}
              >
                <div className="rounded-2xl border border-zinc-100 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:shadow-black/20">
                  <span
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${w.color}20`, color: w.color }}
                  >
                    <Icon name={w.icon} size={24} />
                  </span>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                    {w.name}
                  </p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                    {formatMoney(w.balance)}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {usageCount(w.id)} giao dịch liên quan
                  </p>
                </div>
              </SwipeableItem>
            ))}
          </div>
        </>
      )}

      <WalletFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        editing={editing}
      />
      <TransferModal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
      />

      <Modal
        open={!!detailTarget}
        onClose={() => setDetailTarget(null)}
        title="Chi tiết ví"
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
              <Icon name={detailTarget.icon} size={30} />
            </span>
            <p className="mt-2 text-base font-bold text-zinc-800 dark:text-zinc-100">
              {detailTarget.name}
            </p>
            <p className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
              {formatMoney(detailTarget.balance)}
            </p>
            <div className="mt-3 w-full rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
              <p className="text-xs text-zinc-400">Giao dịch liên quan</p>
              <p className="mt-0.5 text-lg font-bold tabular-nums text-zinc-800 dark:text-zinc-100">
                {usageCount(detailTarget.id)}
              </p>
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
        message={`Bạn có chắc muốn xóa ví "${deleteTarget?.name}"?`}
      />
    </div>
  );
}
