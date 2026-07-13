import { useTranslation } from 'react-i18next';

const STATUS_MAP = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
  SUSPENDED: 'suspended',
  DRAFT: 'draft',
};

export default function Badge({ status, label }) {
  const { t } = useTranslation();
  const cls = STATUS_MAP[status] || 'inactive';
  const text = label || t(`common.${status?.toLowerCase()}`) || status;
  return <span className={`badge badge-${cls}`}>{text}</span>;
}
