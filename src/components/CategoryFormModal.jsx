import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from './ui/Modal';
import Field from './ui/Field';
import Button from './ui/Button';
import TextInput from './ui/TextInput';
import SegmentedButton from './ui/SegmentedButton';
import { ColorPicker } from './ui/IconColorPicker';
import EmojiPicker from './ui/EmojiPicker';
import { useData } from '../contexts/DataContext';
import { useT } from '../i18n';
import { validateCategory, trimValue } from '../utils/validators';
import { CATEGORY_COLORS } from '../utils/defaults';
import { DEFAULT_CATEGORY_EMOJI, getCategoryEmoji } from '../utils/categoryEmoji';

export default function CategoryFormModal({ open, onClose, editing, defaultType = 'expense' }) {
  const t = useT();
  const { categories, addCategory, updateCategory } = useData();
  const blank = { name: '', type: defaultType, emoji: DEFAULT_CATEGORY_EMOJI, color: CATEGORY_COLORS[0] };
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(editing ? { name: editing.name, type: editing.type, emoji: getCategoryEmoji(editing), color: editing.color } : { ...blank, type: defaultType });
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing, defaultType]);

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, name: trimValue(form.name) };
    const existingNames = categories.filter((c) => c.type === payload.type && c.id !== editing?.id).map((c) => c.name);
    const { valid, errors: errs } = validateCategory(payload, existingNames, t);
    setErrors(errs);
    if (!valid) return;
    setSaving(true);
    try {
      if (editing) {
        await updateCategory(editing.id, payload);
        toast.success(t('cat.updated'));
      } else {
        await addCategory(payload);
        toast.success(t('cat.added'));
      }
      onClose();
    } catch {
      toast.error(t('cat.saveError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? t('cat.editTitle') : t('cat.addTitle')}
      variant="sheet"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="text" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="category-form" icon="check" loading={saving}>
            {editing ? t('common.save') : t('common.add')}
          </Button>
        </div>
      }
    >
      <form id="category-form" onSubmit={handleSubmit} className="flex flex-col gap-5 pb-2" noValidate>
        {/* The type is locked when editing: existing transactions rely on it. */}
        <div className={editing ? 'pointer-events-none opacity-60' : ''}>
          <SegmentedButton
            ariaLabel={t('cat.type')}
            value={form.type}
            onChange={(type) => setForm((f) => ({ ...f, type }))}
            options={[
              { id: 'expense', label: t('cat.expenseTab'), activeClass: 'bg-expense-container text-on-expense-container' },
              { id: 'income', label: t('cat.incomeTab'), activeClass: 'bg-income-container text-on-income-container' },
            ]}
          />
        </div>

        <TextInput
          label={t('cat.name')}
          required
          placeholder=" "
          hint={t('cat.nameHint')}
          value={form.name}
          maxLength={40}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          onBlur={(e) => setForm((f) => ({ ...f, name: e.target.value.trim() }))}
          error={errors.name}
        />

        <Field label={t('cat.emoji')}>
          <EmojiPicker value={form.emoji} onChange={(emoji) => setForm((f) => ({ ...f, emoji }))} />
        </Field>

        <Field label={t('common.color')}>
          <ColorPicker colors={CATEGORY_COLORS} value={form.color} onChange={(color) => setForm((f) => ({ ...f, color }))} />
        </Field>
      </form>
    </Modal>
  );
}
