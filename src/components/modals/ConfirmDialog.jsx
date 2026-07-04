import { LuTriangleAlert, LuCircleHelp } from 'react-icons/lu';
import Modal from './Modal';
import Button from '@/components/common/Button';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger', // 'danger' | 'primary'
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={loading ? undefined : onClose} title={title} size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
            variant === 'danger'
              ? 'bg-red-50 text-red-500 dark:bg-red-950/60'
              : 'bg-primary-50 text-primary-600 dark:bg-primary-950'
          }`}
        >
          {variant === 'danger' ? <LuTriangleAlert className="size-5" /> : <LuCircleHelp className="size-5" />}
        </div>
        <p className="pt-1.5 text-sm text-surface-600 dark:text-surface-300">{message}</p>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
