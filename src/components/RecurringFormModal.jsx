import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from './ui/Modal';
import Field from './ui/Field';
import Button from './ui/Button';
import MoneyInput from './ui/MoneyInput';
import TextInput from './ui/TextInput';
import ChoiceSelect from './ui/ChoiceSelect';
import { useData } from '../contexts/DataContext';
import { isPositiveNumber, isNonEmpty, isValidDate, trimValue } from '../utils/validators';
import { toInputDate } from '../utils/format';
import { getCategoryEmoji } from '../utils/categoryEmoji';

const FREQUENCIES = [
  { id: 'daily', label: 'Hàng ngày' },
  { id: 'weekly', label: 'Hàng tuần' },
  { id: 'monthly', label: 'Hàng tháng' },
  { id: 'yearly', label: 'Hàng năm' },
];

const EMPTY = { type: 'expense', amount: '', categoryId: '', walletId: '', note: '', frequency: 'monthly', startDate: toInputDate(new Date()) };

export default function RecurringFormModal({ open, onClose, editing }) {
  const { categories, wallets, addRecurring, updateRecurring } = useData();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        editing
          ? { type: editing.type, amount: editing.amount, categoryId: editing.categoryId, walletId: editing.walletId, note: editing.note || '', frequency: editing.frequency, startDate: toInputDate(editing.startDate) }
          : { ...EMPTY, walletId: wallets[0]?.id || '' }
      );
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  const filteredCategories = categories.filter((c) => c.type === form.type).map((c) => ({ id: c.id, name: c.name, emoji: getCategoryEmoji(c), color: c.color }));
  const walletOptions = wallets.map((w) => ({ id: w.id, name: w.name, icon: w.icon, color: w.color }));

  function validate() {
    const errs = {};
    if (!isPositiveNumber(form.amount)) errs.amount = 'Số tiền phải lớn hơn 0.';
    if (!isNonEmpty(form.categoryId)) errs.categoryId = 'Vui lòng chọn danh mục.';
    if (!isNonEmpty(form.walletId)) errs.walletId = 'Vui lòng chọn ví.';
    if (!isValidDate(form.startDate)) errs.startDate = 'Ngày bắt đầu không hợp lệ.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, note: trimValue(form.note) };
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      if (editing) {
        await updateRecurring(editing.id, { ...payload, active: editing.active });
        toast.success('Đã cập nhật giao dịch định kỳ.');
      } else {
        await addRecurring(payload);
        toast.success('Đã tạo giao dịch định kỳ.');
      }
      onClose();
    } catch {
      toast.error('Không thể lưu giao dịch định kỳ.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Sửa giao dịch định kỳ' : 'Thêm giao dịch định kỳ'} size="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
          <button type="button" onClick={() => setForm((f) => ({ ...f, type: 'expense', categoryId: '' }))} className={`rounded-lg py-2 text-sm font-semibold transition ${form.type === 'expense' ? 'bg-white text-rose-600 shadow-sm dark:bg-zinc-900' : 'text-zinc-500'}`}>
            Chi tiêu
          </button>
          <button type="button" onClick={() => setForm((f) => ({ ...f, type: 'income', categoryId: '' }))} className={`rounded-lg py-2 text-sm font-semibold transition ${form.type === 'income' ? 'bg-white text-emerald-600 shadow-sm dark:bg-zinc-900' : 'text-zinc-500'}`}>
            Thu nhập
          </button>
        </div>

        <Field label="Số tiền" required error={errors.amount}>
          <MoneyInput value={form.amount} onChange={(v) => setForm((f) => ({ ...f, amount: v }))} error={errors.amount} />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Danh mục" required error={errors.categoryId}>
            <ChoiceSelect options={filteredCategories} value={form.categoryId} onChange={(v) => setForm((f) => ({ ...f, categoryId: v }))} placeholder="Chọn danh mục" error={errors.categoryId} />
          </Field>
          <Field label="Ví" required error={errors.walletId}>
            <ChoiceSelect options={walletOptions} value={form.walletId} onChange={(v) => setForm((f) => ({ ...f, walletId: v }))} placeholder="Chọn ví" error={errors.walletId} />
          </Field>
        </div>

        <Field label="Tần suất lặp lại" required>
          <div className="grid grid-cols-4 gap-1.5 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
            {FREQUENCIES.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, frequency: f.id }))}
                className={`rounded-lg py-2 text-xs font-semibold transition ${form.frequency === f.id ? 'bg-white text-accent-700 shadow-sm dark:bg-zinc-900 dark:text-accent-400' : 'text-zinc-500'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Ngày bắt đầu" required error={errors.startDate}>
          <TextInput type="date" icon="event" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
        </Field>

        <Field label="Ghi chú">
          <TextInput icon="edit_note" placeholder="Ví dụ: Tiền thuê nhà" value={form.note} maxLength={200} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} onBlur={(e) => setForm((f) => ({ ...f, note: e.target.value.trim() }))} />
        </Field>

        <div className="mt-1 flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Hủy</Button>
          <Button type="submit" className="flex-1" loading={saving}>{editing ? 'Lưu thay đổi' : 'Tạo giao dịch định kỳ'}</Button>
        </div>
      </form>
    </Modal>
  );
}
