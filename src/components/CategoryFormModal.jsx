import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from './ui/Modal';
import Field from './ui/Field';
import Button from './ui/Button';
import TextInput from './ui/TextInput';
import { ColorPicker } from './ui/IconColorPicker';
import EmojiPicker from './ui/EmojiPicker';
import { useData } from '../contexts/DataContext';
import { validateCategory, trimValue } from '../utils/validators';
import { CATEGORY_COLORS } from '../utils/defaults';
import { DEFAULT_CATEGORY_EMOJI, getCategoryEmoji } from '../utils/categoryEmoji';

export default function CategoryFormModal({ open, onClose, editing, defaultType = 'expense' }) {
  const { categories, addCategory, updateCategory } = useData();
  const [form, setForm] = useState({ name: '', type: defaultType, emoji: DEFAULT_CATEGORY_EMOJI, color: CATEGORY_COLORS[0] });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        editing
          ? { name: editing.name, type: editing.type, emoji: getCategoryEmoji(editing), color: editing.color }
          : { name: '', type: defaultType, emoji: DEFAULT_CATEGORY_EMOJI, color: CATEGORY_COLORS[0] }
      );
      setErrors({});
    }
  }, [open, editing, defaultType]);

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, name: trimValue(form.name) };
    const existingNames = categories.filter((c) => c.type === payload.type && c.id !== editing?.id).map((c) => c.name);
    const { valid, errors: errs } = validateCategory(payload, existingNames);
    setErrors(errs);
    if (!valid) return;
    setSaving(true);
    try {
      if (editing) {
        await updateCategory(editing.id, payload);
        toast.success('Đã cập nhật danh mục.');
      } else {
        await addCategory(payload);
        toast.success('Đã thêm danh mục mới.');
      }
      onClose();
    } catch {
      toast.error('Không thể lưu danh mục.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Sửa danh mục' : 'Thêm danh mục'} size="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, type: 'expense' }))}
            className={`rounded-lg py-2 text-sm font-semibold transition ${form.type === 'expense' ? 'bg-white text-rose-600 shadow-sm dark:bg-zinc-900' : 'text-zinc-500'}`}
          >
            Danh mục chi
          </button>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, type: 'income' }))}
            className={`rounded-lg py-2 text-sm font-semibold transition ${form.type === 'income' ? 'bg-white text-emerald-600 shadow-sm dark:bg-zinc-900' : 'text-zinc-500'}`}
          >
            Danh mục thu
          </button>
        </div>

        <Field label="Tên danh mục" required error={errors.name}>
          <TextInput
            placeholder="Ví dụ: Ăn uống"
            value={form.name}
            maxLength={40}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            onBlur={(e) => setForm((f) => ({ ...f, name: e.target.value.trim() }))}
            error={errors.name}
          />
        </Field>

        <Field label="Biểu tượng (emoji)">
          <EmojiPicker value={form.emoji} onChange={(emoji) => setForm((f) => ({ ...f, emoji }))} />
        </Field>

        <Field label="Màu sắc">
          <ColorPicker colors={CATEGORY_COLORS} value={form.color} onChange={(color) => setForm((f) => ({ ...f, color }))} />
        </Field>

        <div className="mt-1 flex gap-3">
          <Button type="button" variant="outline-danger" icon="close" className="flex-1" onClick={onClose} disabled={saving}>Hủy</Button>
          <Button type="submit" icon="check" className="flex-1" loading={saving}>{editing ? 'Lưu' : 'Thêm'}</Button>
        </div>
      </form>
    </Modal>
  );
}
