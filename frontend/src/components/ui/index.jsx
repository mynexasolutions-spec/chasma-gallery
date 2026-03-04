export const Spinner = () => (
  <div className="d-flex justify-content-center align-items-center py-5">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

export const StatusBadge = ({ value, map }) => {
  const cfg = map[value] || { color: 'secondary', label: value };
  return <span className={`badge bg-${cfg.color}`}>{cfg.label || value}</span>;
};

export const Alert = ({ type = 'danger', message, onClose }) => (
  message ? (
    <div className={`alert alert-${type} alert-dismissible`}>
      {message}
      {onClose && <button className="btn-close" onClick={onClose} />}
    </div>
  ) : null
);

export const Pagination = ({ pagination, onChange }) => {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages } = pagination;
  return (
    <nav className="mt-3">
      <ul className="pagination pagination-sm mb-0 justify-content-end">
        <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onChange(page - 1)}>‹</button>
        </li>
        {Array.from({ length: pages }, (_, i) => i + 1)
          .filter(p => Math.abs(p - page) <= 2)
          .map(p => (
            <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
              <button className="page-link" onClick={() => onChange(p)}>{p}</button>
            </li>
          ))}
        <li className={`page-item ${page >= pages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onChange(page + 1)}>›</button>
        </li>
      </ul>
    </nav>
  );
};

export const StatCard = ({ icon, label, value, color = 'primary', sub }) => (
  <div className="card border-0 shadow-sm h-100">
    <div className="card-body">
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <div className="text-muted small mb-1">{label}</div>
          <div className="fs-4 fw-bold">{value}</div>
          {sub && <div className="text-muted small mt-1">{sub}</div>}
        </div>
        <div className={`bg-${color} bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center`}
             style={{ width: 52, height: 52 }}>
          <i className={`bi ${icon} fs-4 text-${color}`}></i>
        </div>
      </div>
    </div>
  </div>
);

export const PageHeader = ({ title, subtitle, action }) => (
  <div className="d-flex align-items-start justify-content-between mb-4">
    <div>
      <h4 className="fw-bold mb-0">{title}</h4>
      {subtitle && <p className="text-muted small mb-0">{subtitle}</p>}
    </div>
    {action}
  </div>
);
