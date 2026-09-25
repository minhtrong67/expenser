import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal from "./ui/Modal";
import Field from "./ui/Field";
import Button from "./ui/Button";
import MoneyInput from "./ui/MoneyInput";
import TextInput from "./ui/TextInput";
import Textarea from "./ui/Textarea";
import ChoiceSelect from "./ui/ChoiceSelect";
import Icon from "./ui/Icon";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { useRecentEntries } from "../hooks/useRecentEntries";
import Emoji from "./ui/Emoji";
import { validateTransaction, trimValue } from "../utils/validators";
import { toInputDateTimeLocal, formatNumber } from "../utils/format";
import { getCategoryEmoji } from "../utils/categoryEmoji";

function emptyForm() {
  return {
    type: "expense",
    amount: "",
    categoryId: "",
    walletId: "",
    datetime: toInputDateTimeLocal(new Date()),
    note: "",
  };
}

export default function TransactionFormModal({ open, onClose, editingTx }) {
  const {
    categories,
    wallets,
    getCategory,
    getWallet,
    addTransaction,
    updateTransaction,
  } = useData();
  const { user } = useAuth();
  const { forType, remember } = useRecentEntries(user?.uid);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editingTx) {
        setForm({
          type: editingTx.type,
          amount: editingTx.amount,
          categoryId: editingTx.categoryId,
          walletId: editingTx.walletId,
          datetime: toInputDateTimeLocal(editingTx.date),
          note: editingTx.note || "",
        });
      } else {
        setForm({ ...emptyForm(), walletId: wallets[0]?.id || "" });
      }
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingTx]);

  const filteredCategories = categories
    .filter((c) => c.type === form.type)
    .map((c) => ({
      id: c.id,
      name: c.name,
      emoji: getCategoryEmoji(c),
      color: c.color,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'vi'));

  const walletOptions = wallets
    .map((w) => ({
      id: w.id,
      name: w.name,
      icon: w.icon,
      color: w.color,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'vi'));

  function setType(type) {
    setForm((f) => ({ ...f, type, categoryId: "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      note: trimValue(form.note),
      date: new Date(form.datetime),
    };
    const { valid, errors: errs } = validateTransaction(payload);
    setErrors(errs);
    if (!valid) return;
    setSaving(true);
    try {
      if (editingTx) {
        await updateTransaction(editingTx.id, payload, editingTx);
        toast.success("Đã cập nhật giao dịch.");
      } else {
        await addTransaction(payload);
        remember(payload);
        toast.success("Đã thêm giao dịch mới.");
      }
      onClose();
    } catch (err) {
      toast.error("Không thể lưu giao dịch. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const recentForType = !editingTx ? forType(form.type) : [];

  // Quick-fill only sets amount/category/wallet — date & time always stay "now".
  function applyRecent(entry) {
    setForm((f) => ({
      ...f,
      categoryId: entry.categoryId,
      walletId: entry.walletId,
      amount: entry.amount,
      datetime: toInputDateTimeLocal(new Date()),
    }));
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingTx ? "Sửa giao dịch" : "Thêm giao dịch"}
      size="full"
      footer={
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline-danger"
            icon="close"
            className="flex-1"
            onClick={onClose}
            disabled={saving}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form="transaction-form"
            icon="check"
            className="flex-1"
            loading={saving}
          >
            {editingTx ? "Lưu" : "Thêm"}
          </Button>
        </div>
      }
    >
      <form id="transaction-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
          <button
            type="button"
            onClick={() => setType("expense")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold transition ${
              form.type === "expense"
                ? "bg-white text-rose-600 shadow-sm dark:bg-zinc-900"
                : "text-zinc-500"
            }`}
          >
            <Icon name="arrow_downward" size={18} /> Chi tiêu
          </button>
          <button
            type="button"
            onClick={() => setType("income")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold transition ${
              form.type === "income"
                ? "bg-white text-emerald-600 shadow-sm dark:bg-zinc-900"
                : "text-zinc-500"
            }`}
          >
            <Icon name="arrow_upward" size={18} /> Thu nhập
          </button>
        </div>

        {recentForType.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold text-zinc-400">
              Gần đây — chạm để điền nhanh
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {recentForType.map((r, idx) => {
                const cat = getCategory(r.categoryId);
                const wallet = getWallet(r.walletId);
                return (
                  <button
                    key={`${r.categoryId}-${r.amount}-${r.note}-${idx}`}
                    type="button"
                    onClick={() => applyRecent(r)}
                    className="flex shrink-0 items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-left text-xs transition hover:border-accent-400 hover:bg-accent-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-accent-500/10"
                  >
                    <Emoji size={15}>{getCategoryEmoji(cat)}</Emoji>
                    <span className="font-medium text-zinc-700 dark:text-zinc-200">
                      {cat?.name || "Khác"}
                    </span>
                    <span className="font-semibold tabular-nums text-zinc-500">
                      {formatNumber(r.amount)}đ
                    </span>
                    {wallet && (
                      <span className="text-zinc-400">· {wallet.name}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <Field label="Số tiền" required error={errors.amount}>
          <MoneyInput
            value={form.amount}
            onChange={(v) => setForm((f) => ({ ...f, amount: v }))}
            error={errors.amount}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Danh mục" required error={errors.categoryId}>
            <ChoiceSelect
              options={filteredCategories}
              value={form.categoryId}
              onChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
              placeholder="Chọn danh mục"
              error={errors.categoryId}
              emptyLabel="Chưa có danh mục, hãy thêm ở trang Danh mục"
            />
          </Field>
          <Field label="Ví / Tài khoản" required error={errors.walletId}>
            <ChoiceSelect
              options={walletOptions}
              value={form.walletId}
              onChange={(v) => setForm((f) => ({ ...f, walletId: v }))}
              placeholder="Chọn ví"
              error={errors.walletId}
              emptyLabel="Chưa có ví, hãy thêm ở trang Ví"
            />
          </Field>
        </div>

        <Field label="Ngày giờ giao dịch" required error={errors.date}>
          <TextInput
            type="datetime-local"
            icon="event"
            max={toInputDateTimeLocal(new Date())}
            value={form.datetime}
            onChange={(e) =>
              setForm((f) => ({ ...f, datetime: e.target.value }))
            }
          />
        </Field>

        <Field
          label="Ghi chú"
          error={errors.note}
          hint="Không bắt buộc, tối đa 200 ký tự"
        >
          <Textarea
            icon="edit_note"
            placeholder="Ví dụ: Ăn trưa cùng đồng nghiệp"
            value={form.note}
            maxLength={200}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            onBlur={(e) =>
              setForm((f) => ({ ...f, note: e.target.value.trim() }))
            }
          />
        </Field>
      </form>
    </Modal>
  );
}
