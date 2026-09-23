import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from './ui/Modal';
import Field from './ui/Field';
import Button from './ui/Button';
import TextInput from './ui/TextInput';
import MoneyInput from './ui/MoneyInput';
import { IconPicker, ColorPicker } from './ui/IconColorPicker';
import { useData } from '../contexts/DataContext';
import { validateWallet, trimValue } from '../utils/validators';
import { WALLET_ICONS, CATEGORY_COLORS } from '../utils/defaults';

export default function WalletFormModal({ open, onClose, editing }) {
  const { wallets, addWallet, updateWallet } = useData();
  const [form, setForm] = useState({ name: '', icon: WALLET_ICONS[0], color: CATEGORY_COLORS[0], balance: 0 });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(editing ? { name: editing.name, icon: editing.icon, color: editing.color, balance: editing.balance } : { name: '', icon: WALLET_ICONS[0], color: CATEGORY_COLORS[0], balance: 0 });
      setErrors({});
    }
  }, [open, editing]);

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, name: trimValue(form.name) };
    const existingNames = wallets.filter((w) => w.id !== editing?.id).map((w) => w.name);
    const { valid, errors: errs } = validateWallet(payload, existingNames);
    setErrors(errs);
    if (!valid) return;
    setSaving(true);
    try {
      if (editing) {
        await updateWallet(editing.id, payload);
        toast.success('Đã cập nhật ví.');
      } else {
        await addWallet(payload);
        toast.success('Đã thêm ví mới.');
      }
      onClose();
    } catch {
      toast.error('Không thể lưu ví.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Sửa ví' : 'Thêm ví mới'} size="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Tên ví" required error={errors.name}>
          <TextInput
            placeholder="Ví dụ: Ngân hàng Vietcombank"
            value={form.name}
            maxLength={40}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            onBlur={(e) => setForm((f) => ({ ...f, name: e.target.value.trim() }))}
            error={errors.name}
          />
        </Field>

        {!editing && (
          <Field label="Số dư ban đầu" required error={errors.balance}>
            <MoneyInput value={form.balance} onChange={(v) => setForm((f) => ({ ...f, balance: v }))} error={errors.balance} />
          </Field>
        )}

        <Field label="Biểu tượng">
          <IconPicker icons={WALLET_ICONS} value={form.icon} onChange={(icon) => setForm((f) => ({ ...f, icon }))} />
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
