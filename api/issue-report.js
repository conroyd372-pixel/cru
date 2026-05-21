import { auditEvent } from "./_lib/audit.js";
import { getCurrentUserContext, roles } from "./_lib/auth.js";
import { methodNotAllowed, readJson, sendJson } from "./_lib/http.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return methodNotAllowed(response);
  }

  const user = getCurrentUserContext(request);
  const report = await readJson(request);
  const allowedRoles = [roles.CLIENT, roles.COMPANY_ADMIN, roles.TALENT, roles.ADMIN];

  if (!allowedRoles.includes(user.role)) {
    return sendJson(response, 403, {
      ok: false,
      message: "You need an active CariReps account to report an issue."
    });
  }

  if (!report.subject || !report.description) {
    return sendJson(response, 400, {
      ok: false,
      message: "Issue report needs a subject and a description."
    });
  }

  const ticket = {
    id: `issue_${Date.now()}`,
    companyId: user.companyId || report.companyId || null,
    reporterUserId: user.userId,
    reporterName: user.displayName,
    reporterRole: user.role,
    subject: report.subject,
    description: report.description,
    severity: report.severity || "normal",
    status: "sent_to_admin_center",
    createdAt: new Date().toISOString()
  };

  auditEvent({
    type: "issue_reported",
    severity: ticket.severity,
    actorUserId: user.userId,
    actorName: user.displayName,
    actorRole: user.role,
    companyId: ticket.companyId,
    entityType: "issue",
    entityId: ticket.id,
    plainEnglish: `${user.displayName} reported an issue: ${ticket.subject}.`
  });

  return sendJson(response, 200, { ok: true, issue: ticket });
}
