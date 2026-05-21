import { getCurrentUserContext, requireRole, roles } from "./_lib/auth.js";
import { auditEvent } from "./_lib/audit.js";
import { methodNotAllowed, readJson, sendJson } from "./_lib/http.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return methodNotAllowed(response);
  }

  const admin = getCurrentUserContext(request);
  const roleCheck = requireRole(admin, [roles.ADMIN]);
  if (!roleCheck.ok) {
    return sendJson(response, roleCheck.status, roleCheck);
  }

  const { action = "link", talentUserId, clientCompanyId, projectId } = await readJson(request);
  if (!talentUserId || !clientCompanyId) {
    return sendJson(response, 400, {
      ok: false,
      message: "Choose both a talent user and a client company before linking."
    });
  }

  const event = auditEvent({
    type: "talent_client_assignment_changed",
    severity: "high",
    actorUserId: admin.userId,
    actorName: admin.displayName,
    actorRole: admin.role,
    companyId: clientCompanyId,
    entityType: "talent_assignment",
    entityId: `${clientCompanyId}:${talentUserId}`,
    action,
    plainEnglish: `${admin.displayName} ${action === "disconnect" ? "disconnected" : "linked"} talent ${talentUserId} ${action === "disconnect" ? "from" : "to"} client company ${clientCompanyId}.`
  });

  return sendJson(response, 200, {
    ok: true,
    assignment: {
      action,
      talentUserId,
      clientCompanyId,
      projectId,
      updatedAt: event.createdAt
    }
  });
}

