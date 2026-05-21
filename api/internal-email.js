import { auditEvent } from "./_lib/audit.js";
import { getCurrentUserContext, requireCompanyAccess, roles } from "./_lib/auth.js";
import { methodNotAllowed, readJson, sendJson } from "./_lib/http.js";
import { buildModerationReport, inspectMessage } from "./_lib/moderation.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return methodNotAllowed(response);
  }

  const user = getCurrentUserContext(request);
  const allowedRoles = [roles.ADMIN, roles.COMPANY_ADMIN, roles.TALENT];
  if (!allowedRoles.includes(user.role)) {
    return sendJson(response, 403, {
      ok: false,
      message: "Only company administrators, assigned talent, and CariReps admins can use internal email."
    });
  }

  const email = await readJson(request);
  const companyCheck = requireCompanyAccess(user, email.companyId);
  if (!companyCheck.ok && user.role !== roles.TALENT) {
    return sendJson(response, companyCheck.status, companyCheck);
  }

  if (!email.subject || !email.message || !email.recipientUserId) {
    return sendJson(response, 400, {
      ok: false,
      message: "Internal email needs a recipient, subject, and message."
    });
  }

  const inspection = inspectMessage(email.message);
  if (!inspection.allowed) {
    const report = buildModerationReport({
      user,
      body: email.message,
      threadId: email.threadId || null,
      companyId: email.companyId,
      violations: inspection.violations
    });
    auditEvent(report);
    return sendJson(response, 422, {
      ok: false,
      message: "Internal email blocked. Please keep operational communication inside CariReps without sharing direct email addresses or phone numbers.",
      report
    });
  }

  const record = {
    id: `internal_email_${Date.now()}`,
    companyId: email.companyId || user.companyId || null,
    senderUserId: user.userId,
    senderName: user.displayName,
    recipientUserId: email.recipientUserId,
    subject: email.subject,
    message: email.message,
    status: "sent",
    createdAt: new Date().toISOString()
  };

  auditEvent({
    type: "internal_email_sent",
    severity: "info",
    actorUserId: user.userId,
    actorName: user.displayName,
    actorRole: user.role,
    companyId: record.companyId,
    entityType: "internal_email",
    entityId: record.id,
    plainEnglish: `${user.displayName} sent internal email "${record.subject}" to assigned user ${record.recipientUserId}.`
  });

  return sendJson(response, 200, { ok: true, internalEmail: record });
}
