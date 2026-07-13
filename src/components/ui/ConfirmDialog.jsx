import { useTranslation } from 'react-i18next';
import Modal from './Modal';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, loading }) {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || t('common.confirmDelete')}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
            {t('common.cancel')}
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? t('common.loading') : t('common.delete')}
          </button>
        </>
      }
    >
      <p style={{ color: 'var(--gray-700)', fontSize: '14px' }}>
        {message || t('common.confirmDelete')}
      </p>
    </Modal>
  );
}
