import { useTranslation } from 'react-i18next';

export default function Pagination({ meta, onPageChange }) {
  const { t } = useTranslation();
  if (!meta || meta.totalPages <= 1) return null;

  const { page, totalPages, total, limit } = meta;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="pagination">
      <span className="pagination-info">
        {t('common.showing')} {from}–{to} {t('common.of')} {total}
      </span>
      <button
        className="pagination-btn"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        {t('common.previous')}
      </button>
      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        let p;
        if (totalPages <= 5) p = i + 1;
        else if (page <= 3) p = i + 1;
        else if (page >= totalPages - 2) p = totalPages - 4 + i;
        else p = page - 2 + i;
        return (
          <button
            key={p}
            className={`pagination-btn${page === p ? ' active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        );
      })}
      <button
        className="pagination-btn"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        {t('common.next')}
      </button>
    </div>
  );
}
