import Modal from './Modal';
import Button from './Button';
import Icon from './Icon';

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Xác nhận', message, confirmText = 'Xóa', confirmIcon, danger = true, loading }) {
  const icon = confirmIcon || (danger ? 'delete' : 'check');
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${danger ? 'bg-rose-50 text-rose-500 dark:bg-rose-500/10' : 'bg-accent-50 text-accent-600 dark:bg-accent-500/10'}`}>
          <Icon name={danger ? 'warning' : 'help'} size={26} />
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{message}</p>
        <div className="mt-2 flex w-full gap-3">
          <Button variant="outline-danger" icon="close" className="flex-1" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} icon={icon} className="flex-1" onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
