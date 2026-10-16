import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from './ui/Modal';
import Field from './ui/Field';
import Button from './ui/Button';
import TextInput from './ui/TextInput';
import MoneyInput from './ui/MoneyInput';
import { IconPicker, ColorPicker } from './ui/IconColorPicker';
import { useData } from '../contexts/DataContext';
import { useT } from '../i18n';
import { validateWallet, trimValue } from '../utils/validators';
import { WALLET_ICONS, CATEGORY_COLORS } from '../utils/defaults';

const BLANK = { name: '', icon: WALLET_ICONS[0], color: CATEGORY_COLORS[0], balance: 0 };

export default function WalletFormModal({ open, onClose, editing }) {
  const t = useT();
  const { wallets, addWallet, updateWallet } = useData();
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(editing ? { name: editing.name, icon: editing.icon, color: editing.color, balance: editing.balance } : BLANK);
    setErrors({});
  }, [open, editing]);

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, name: trimValue(form.name) };
    const existingNames = wallets.filter((w) => w.id !== editing?.id).map((w) => w.name);
    const { valid, errors: errs } = validateWallet(payload, existingNames, t);
    setErrors(errs);
    if (!valid) return;
    setSaving(true);
    try {
      if (editing) {
        await updateWallet(editing.id, payload);
        toast.success(t('wallet.updated'));
      } else {
        await addWallet(payload);
        toast.success(t('wallet.added'));
      }
      onClose();
    } catch {
      toast.error(t('wallet.saveError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? t('wallet.editTitle') : t('wallet.addTitle')}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="text" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="wallet-form" icon="check" loading={saving}>
            {editing ? t('common.save') : t('common.add')}
          </Button>
        </div>
      }
    >
      <form id="wallet-form" onSubmit={handleSubmit} className="flex flex-col gap-5 pb-2" noValidate>
        <TextInput
          label={t('wallet.name')}
          required
          value={form.name}
          maxLength={40}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          onBlur={(e) => setForm((f) => ({ ...f, name: e.target.value.trim() }))}
          error={errors.name}
        />
        {!editing && <MoneyInput label={t('wallet.initialBalance')} value={form.balance} onChange={(v) => setForm((f) => ({ ...f, balance: v }))} error={errors.balance} />}
        <Field label={t('wallet.icon')}>
          <IconPicker icons={WALLET_ICONS} value={form.icon} onChange={(icon) => setForm((f) => ({ ...f, icon }))} />
        </Field>
        <Field label={t('common.color')}>
          <ColorPicker colors={CATEGORY_COLORS} value={form.color} onChange={(color) => setForm((f) => ({ ...f, color }))} />
        </Field>
      </form>
    </Modal>
  );
}
