import { useTranslation } from 'react-i18next';

export default function EmptyState({ icon = '📭', title, description, action }) {
  const { t } = useTranslation();

  const renderAction = () => {
    if (!action) return null;
    if (typeof action === 'object' && action !== null && 'label' in action && 'onClick' in action) {
      return (
        <button type="button" className="btn btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      );
    }
    return action;
  };

  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <div className="empty-state-title">{title || t('common.noData')}</div>
      {description && <div className="empty-state-desc">{description}</div>}
      {action && <div style={{ marginTop: 20 }}>{renderAction()}</div>}
    </div>
  );
}
