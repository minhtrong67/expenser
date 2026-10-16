import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from './ui/Modal';
import Button from './ui/Button';
import MoneyInput from './ui/MoneyInput';
import TextInput from './ui/TextInput';
import ChoiceSelect from './ui/ChoiceSelect';
import Icon from './ui/Icon';
import { useData } from '../contexts/DataContext';
import { useT, useI18n } from '../i18n';
import { isPositiveNumber } from '../utils/validators';
import { toInputDate, formatMoney } from '../utils/format';

export default function TransferModal({ open, onClose, defaultFromWalletId }) {
  const t = useT();
  const { locale } = useI18n();
  const { wallets, transferBetweenWallets } = useData();
  const [form, setForm] = useState({ fromWalletId: '', toWalletId: '', amount: '', date: toInputDate(new Date()), note: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({ fromWalletId: defaultFromWalletId || wallets[0]?.id || '', toWalletId: '', amount: '', date: toInputDate(new Date()), note: '' });
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultFromWalletId]);

  const fromWallet = wallets.find((w) => w.id === form.fromWalletId);
  const walletOptions = useMemo(
    () =>
      wallets
        .map((w) => ({ id: w.id, name: w.name, icon: w.icon, color: w.color, subtitle: formatMoney(w.balance) }))
        .sort((a, b) => a.name.localeCompare(b.name, locale)),
    [wallets, locale],
  );
  const toOptions = walletOptions.filter((w) => w.id !== form.fromWalletId);

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.fromWalletId) errs.fromWalletId = t('transfer.pickFrom');
    if (!form.toWalletId) errs.toWalletId = t('transfer.pickTo');
    if (form.fromWalletId && form.fromWalletId === form.toWalletId) errs.toWalletId = t('transfer.sameWallet');
    if (!isPositiveNumber(form.amount)) errs.amount = t('validation.amountPositive');
    else if (fromWallet && Number(form.amount) > fromWallet.balance) errs.amount = t('transfer.insufficient');
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      await transferBetweenWallets(form);
      toast.success(t('transfer.success'));
      onClose();
    } catch {
      toast.error(t('transfer.error'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('transfer.title')}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="text" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="transfer-form" icon="sync_alt" loading={saving}>
            {t('transfer.submit')}
          </Button>
        </div>
      }
    >
      <form id="transfer-form" onSubmit={handleSubmit} className="flex flex-col gap-5 pb-2" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-start">
          <ChoiceSelect label={t('transfer.from')} required options={walletOptions} value={form.fromWalletId} onChange={(v) => setForm((f) => ({ ...f, fromWalletId: v }))} error={errors.fromWalletId} />
          <div className="hidden h-14 items-center justify-center sm:flex">
            <Icon name="arrow_forward" className="text-on-surface-variant" />
          </div>
          <ChoiceSelect label={t('transfer.to')} required options={toOptions} value={form.toWalletId} onChange={(v) => setForm((f) => ({ ...f, toWalletId: v }))} error={errors.toWalletId} emptyLabel={t('transfer.needTwo')} />
        </div>
        <MoneyInput label={t('tx.amount')} value={form.amount} onChange={(v) => setForm((f) => ({ ...f, amount: v }))} error={errors.amount} />
        <TextInput type="date" label={t('common.date')} icon="event" max={toInputDate(new Date())} value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
        <TextInput label={t('tx.note')} icon="edit_note" hint={t('transfer.noteHint')} value={form.note} maxLength={200} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} onBlur={(e) => setForm((f) => ({ ...f, note: e.target.value.trim() }))} />
      </form>
    </Modal>
  );
}
