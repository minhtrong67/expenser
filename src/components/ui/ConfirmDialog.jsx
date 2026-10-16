import { useT } from '../../i18n';
import Modal from './Modal';
import Button from './Button';
import Icon from './Icon';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText, confirmIcon, danger = true, loading }) {
  const t = useT();
  return (
    <Modal open={open} onClose={onClose} title={title || t('common.confirm')} size="sm">
      <div className="flex flex-col items-center gap-4 pt-2 text-center">
        <span
          className={`flex h-14 w-14 items-center justify-center rounded-full ${
            danger ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-container'
          }`}
        >
          <Icon name={danger ? 'warning' : 'help'} size={28} />
        </span>
        <p className="text-body-lg text-on-surface-variant">{message}</p>
        <div className="mt-2 flex w-full justify-end gap-2">
          <Button variant="text" onClick={onClose} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button
            variant={danger ? 'danger' : 'filled'}
            icon={confirmIcon || (danger ? 'delete' : 'check')}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText || t('common.delete')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
