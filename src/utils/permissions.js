export function hasPermission(user, permission) {
  if (!user) return false;
  if (user.role?.key === 'SUPER_ADMIN') return true;
  return (user.permissions || []).includes(permission);
}

export function hasRole(user, ...roles) {
  if (!user) return false;
  return roles.includes(user.role?.key);
}

export function isAdminRole(user) {
  return hasRole(user, 'SUPER_ADMIN', 'ADMIN');
}
