import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children, permission }) {
  const { user, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (permission && !hasPermission(permission)) {
    return (
      <div className="page-content">
        <div className="empty-state">
          <div className="empty-state-icon">🔒</div>
          <div className="empty-state-title">غير مصرح</div>
          <div className="empty-state-desc">ليس لديك صلاحية للوصول إلى هذه الصفحة</div>
        </div>
      </div>
    );
  }

  return children;
}
