import { getCurrentUserContext, requireCompanyAccess, roles } from "./_lib/auth.js";
import { auditEvent } from "./_lib/audit.js";
import { methodNotAllowed, readJson, sendJson } from "./_lib/http.js";
import { buildModerationReport, inspectMessage } from "./_lib/moderation.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return methodNotAllowed(response);
  }

  const user = getCurrentUserContext(request);
  const body = await readJson(request);
  const { companyId, threadId, projectId, message = "", recipientScope = "admin" } = body;

  const allowedRoles = [roles.ADMIN, roles.CLIENT, roles.COMPANY_ADMIN, roles.TALENT];
  if (!allowedRoles.includes(user.role)) {
    return sendJson(response, 403, {
      ok: false,
      message: "Only clients, assigned talent, and admins can send project messages."
    });
  }

  const companyCheck = requireCompanyAccess(user, companyId);
  if (!companyCheck.ok && user.role !== roles.TALENT) {
    return sendJson(response, companyCheck.status, companyCheck);
  }

  const inspection = inspectMessage(message);
  if (!inspection.allowed) {
    const report = buildModerationReport({
      user,
      body: message,
      threadId,
      companyId,
      violations: inspection.violations
    });
    auditEvent(report);

    return sendJson(response, 422, {
      ok: false,
      message: "Message blocked. Please do not share email addresses or phone numbers in CariReps messages.",
      report
    });
  }

  const savedMessage = {
    id: `msg_${Date.now()}`,
    companyId,
    projectId,
    threadId: threadId || `thread_${Date.now()}`,
    senderUserId: user.userId,
    senderRole: user.role,
    recipientScope,
    body: message,
    createdAt: new Date().toISOString()
  };

  auditEvent({
    type: "message_sent",
    severity: "info",
    actorUserId: user.userId,
    actorName: user.displayName,
    actorRole: user.role,
    companyId,
    entityType: "message",
    entityId: savedMessage.id,
    plainEnglish: `${user.displayName} sent a message in ${companyId || "a project thread"}.`
  });

  return sendJson(response, 200, { ok: true, message: savedMessage });
}

