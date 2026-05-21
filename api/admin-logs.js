import { getCurrentUserContext, requireRole, roles } from "./_lib/auth.js";
import { methodNotAllowed, sendJson } from "./_lib/http.js";

export default function handler(request, response) {
  if (request.method !== "GET") {
    return methodNotAllowed(response, "GET");
  }

  const admin = getCurrentUserContext(request);
  const roleCheck = requireRole(admin, [roles.ADMIN]);
  if (!roleCheck.ok) {
    return sendJson(response, roleCheck.status, roleCheck);
  }

  return sendJson(response, 200, {
    ok: true,
    logs: [
      {
        id: "audit_demo_1",
        severity: "high",
        plainEnglish: "Marcus Johnson attempted to send a phone number to Horizon Dental. The message was blocked before delivery.",
        actorName: "Marcus Johnson",
        actorRole: "talent",
        action: "blocked_contact_sharing_attempt",
        companyId: "horizon-dental",
        createdAt: new Date().toISOString()
      },
      {
        id: "audit_demo_2",
        severity: "info",
        plainEnglish: "Admin linked Ana Rivera to Horizon Dental Project 01.",
        actorName: "CariReps Admin",
        actorRole: "admin",
        action: "talent_linked_to_client",
        companyId: "horizon-dental",
        createdAt: new Date().toISOString()
      }
    ]
  });
}

