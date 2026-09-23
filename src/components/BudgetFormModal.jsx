import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from './ui/Modal';
import Field from './ui/Field';
import Button from './ui/Button';
import MoneyInput from './ui/MoneyInput';
import ChoiceSelect from './ui/ChoiceSelect';
import TextInput from './ui/TextInput';
import { useData } from '../contexts/DataContext';
import { validateBudget } from '../utils/validators';
import { monthKey } from '../utils/format';
import { getCategoryEmoji } from '../utils/categoryEmoji';

export default function BudgetFormModal({ open, onClose, editing, currentMonth }) {
  const { categories, budgets, addBudget, updateBudget } = useData();
  const [form, setForm] = useState({ categoryId: '', limit: '', month: currentMonth || monthKey(new Date()) });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(editing ? { categoryId: editing.categoryId, limit: editing.limit, month: editing.month } : { categoryId: '', limit: '', month: currentMonth || monthKey(new Date()) });
      setErrors({});
    }
  }, [open, editing, currentMonth]);

  const expenseCategories = categories
    .filter((c) => c.type === 'expense')
    .filter((c) => editing?.categoryId === c.id || !budgets.some((b) => b.categoryId === c.id && b.month === form.month))
    .map((c) => ({ id: c.id, name: c.name, emoji: getCategoryEmoji(c), color: c.color }));

  async function handleSubmit(e) {
    e.preventDefault();
    const { valid, errors: errs } = validateBudget(form);
    setErrors(errs);
    if (!valid) return;
    setSaving(true);
    try {
      if (editing) {
        await updateBudget(editing.id, form);
        toast.success('Đã cập nhật ngân sách.');
      } else {
        await addBudget(form);
        toast.success('Đã tạo ngân sách mới.');
      }
      onClose();
    } catch {
      toast.error('Không thể lưu ngân sách.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Sửa ngân sách' : 'Tạo ngân sách mới'} size="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Tháng áp dụng" required error={errors.month}>
          <TextInput type="month" icon="calendar_month" value={form.month} onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))} />
        </Field>
        <Field label="Danh mục" required error={errors.categoryId}>
          <ChoiceSelect
            options={expenseCategories}
            value={form.categoryId}
            onChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
            placeholder="Chọn danh mục chi"
            error={errors.categoryId}
            emptyLabel="Tất cả danh mục đã có ngân sách cho tháng này"
          />
        </Field>
        <Field label="Hạn mức chi tiêu" required error={errors.limit}>
          <MoneyInput value={form.limit} onChange={(v) => setForm((f) => ({ ...f, limit: v }))} error={errors.limit} />
        </Field>
        <div className="mt-1 flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Hủy</Button>
          <Button type="submit" className="flex-1" loading={saving}>{editing ? 'Lưu thay đổi' : 'Tạo ngân sách'}</Button>
        </div>
      </form>
    </Modal>
  );
}
