import { getCurrentUserContext, requireRole, roles } from "./_lib/auth.js";
import { auditEvent } from "./_lib/audit.js";
import { methodNotAllowed, readJson, sendJson } from "./_lib/http.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return methodNotAllowed(response);
  }

  const user = getCurrentUserContext(request);
  const roleCheck = requireRole(user, [roles.CLIENT, roles.COMPANY_ADMIN, roles.ADMIN]);
  if (!roleCheck.ok) {
    return sendJson(response, roleCheck.status, roleCheck);
  }

  const subscriptionStatus = request.headers["x-subscription-status"] || "inactive";
  if (user.role !== roles.ADMIN && subscriptionStatus !== "active") {
    return sendJson(response, 402, {
      ok: false,
      message: "Please activate your CariReps membership before submitting company service requests."
    });
  }

  const intake = await readJson(request);
  const record = {
    id: `request_${Date.now()}`,
    companyId: user.companyId || intake.companyId,
    status: "new_service_request",
    ...intake,
    createdAt: new Date().toISOString()
  };

  auditEvent({
    type: "client_service_request_submitted",
    severity: "info",
    actorUserId: user.userId,
    actorName: user.displayName,
    actorRole: user.role,
    companyId: record.companyId,
    entityType: "service_request",
    entityId: record.id,
    plainEnglish: `${user.displayName} submitted a company service request.`
  });

  return sendJson(response, 200, { ok: true, request: record });
}

