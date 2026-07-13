import { useAuth } from '../../contexts/AuthContext';

export default function PermissionGuard({ permission, children, fallback = null }) {
  const { hasPermission } = useAuth();
  if (!hasPermission(permission)) return fallback;
  return children;
}
