export const roles = {
  ADMIN: "admin",
  CLIENT: "client",
  COMPANY_ADMIN: "company_admin",
  TALENT: "talent",
  TALENT_APPLICANT: "talent_applicant"
};

export function getCurrentUserContext(request) {
  return {
    userId: request.headers["x-user-id"] || "demo-user",
    role: request.headers["x-user-role"] || roles.CLIENT,
    companyId: request.headers["x-company-id"] || null,
    displayName: request.headers["x-user-name"] || "Demo User",
    email: request.headers["x-user-email"] || null
  };
}

export function requireRole(user, allowedRoles) {
  if (!allowedRoles.includes(user.role)) {
    const allowed = allowedRoles.join(", ");
    return {
      ok: false,
      status: 403,
      message: `Access denied. ${user.displayName} has role "${user.role}", but this action requires: ${allowed}.`
    };
  }

  return { ok: true };
}

export function requireCompanyAccess(user, companyId) {
  if (user.role === roles.ADMIN) {
    return { ok: true };
  }

  if (!companyId || !user.companyId || user.companyId !== companyId) {
    return {
      ok: false,
      status: 403,
      message: `${user.displayName} cannot access this company workspace.`
    };
  }

  return { ok: true };
}

