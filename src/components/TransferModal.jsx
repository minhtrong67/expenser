import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from './ui/Modal';
import Field from './ui/Field';
import Button from './ui/Button';
import MoneyInput from './ui/MoneyInput';
import TextInput from './ui/TextInput';
import ChoiceSelect from './ui/ChoiceSelect';
import Icon from './ui/Icon';
import { useData } from '../contexts/DataContext';
import { isPositiveNumber } from '../utils/validators';
import { toInputDate, formatMoney } from '../utils/format';

export default function TransferModal({ open, onClose, defaultFromWalletId }) {
  const { wallets, transferBetweenWallets } = useData();
  const [form, setForm] = useState({ fromWalletId: '', toWalletId: '', amount: '', date: toInputDate(new Date()), note: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        fromWalletId: defaultFromWalletId || wallets[0]?.id || '',
        toWalletId: '',
        amount: '',
        date: toInputDate(new Date()),
        note: '',
      });
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultFromWalletId]);

  const fromWallet = wallets.find((w) => w.id === form.fromWalletId);
  const walletOptions = wallets
    .map((w) => ({ id: w.id, name: w.name, icon: w.icon, color: w.color, subtitle: formatMoney(w.balance) }))
    .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  const toOptions = walletOptions.filter((w) => w.id !== form.fromWalletId);

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.fromWalletId) errs.fromWalletId = 'Chọn ví nguồn.';
    if (!form.toWalletId) errs.toWalletId = 'Chọn ví đích.';
    if (form.fromWalletId && form.fromWalletId === form.toWalletId) errs.toWalletId = 'Ví đích phải khác ví nguồn.';
    if (!isPositiveNumber(form.amount)) errs.amount = 'Số tiền phải lớn hơn 0.';
    else if (fromWallet && Number(form.amount) > fromWallet.balance) errs.amount = 'Số dư ví nguồn không đủ.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      await transferBetweenWallets(form);
      toast.success('Đã chuyển tiền thành công.');
      onClose();
    } catch {
      toast.error('Không thể thực hiện chuyển khoản.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Chuyển tiền giữa các ví" size="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
          <Field label="Từ ví" required error={errors.fromWalletId}>
            <ChoiceSelect options={walletOptions} value={form.fromWalletId} onChange={(v) => setForm((f) => ({ ...f, fromWalletId: v }))} error={errors.fromWalletId} />
          </Field>
          <div className="hidden justify-center pb-3 sm:flex">
            <Icon name="arrow_forward" className="text-zinc-300" />
          </div>
          <Field label="Đến ví" required error={errors.toWalletId}>
            <ChoiceSelect options={toOptions} value={form.toWalletId} onChange={(v) => setForm((f) => ({ ...f, toWalletId: v }))} error={errors.toWalletId} emptyLabel="Cần ít nhất 2 ví" />
          </Field>
        </div>

        <Field label="Số tiền" required error={errors.amount}>
          <MoneyInput value={form.amount} onChange={(v) => setForm((f) => ({ ...f, amount: v }))} error={errors.amount} />
        </Field>

        <Field label="Ngày" required>
          <TextInput type="date" icon="event" max={toInputDate(new Date())} value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
        </Field>

        <Field label="Ghi chú">
          <TextInput icon="edit_note" placeholder="Không bắt buộc" value={form.note} maxLength={200} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} onBlur={(e) => setForm((f) => ({ ...f, note: e.target.value.trim() }))} />
        </Field>

        <div className="mt-1 flex gap-3">
          <Button type="button" variant="outline-danger" icon="close" className="flex-1" onClick={onClose} disabled={saving}>Hủy</Button>
          <Button type="submit" icon="check" className="flex-1" loading={saving}>Chuyển tiền</Button>
        </div>
      </form>
    </Modal>
  );
}
