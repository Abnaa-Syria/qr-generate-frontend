import { useAuth } from '../contexts/AuthContext';

export function usePermissions() {
  const { user, hasPermission, hasRole } = useAuth();

  const can = (...perms) => perms.some((p) => hasPermission(p));
  const is = (...roles) => hasRole(...roles);
  const isSuperAdmin = () => hasRole('SUPER_ADMIN');

  return { can, is, isSuperAdmin, user };
}

export default usePermissions;
