import { auditEvent } from "./_lib/audit.js";
import { getCurrentUserContext, requireRole, roles } from "./_lib/auth.js";
import { methodNotAllowed, readJson, sendJson } from "./_lib/http.js";
import { runAllSkills, runSkill, skillRegistry } from "./_lib/agent-skills.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return methodNotAllowed(response);
  }

  const admin = getCurrentUserContext(request);
  const roleCheck = requireRole(admin, [roles.ADMIN]);
  if (!roleCheck.ok) {
    return sendJson(response, roleCheck.status, roleCheck);
  }

  const body = await readJson(request);
  const payload = body.payload || body;
  const results = body.skill && body.skill !== "all"
    ? [runSkill(body.skill, payload)]
    : runAllSkills(payload);

  auditEvent({
    type: "agentic_skills_run",
    severity: "info",
    actorUserId: admin.userId,
    actorName: admin.displayName,
    actorRole: admin.role,
    entityType: "agentic_runner",
    entityId: `agentic_${Date.now()}`,
    plainEnglish: `${admin.displayName} ran ${body.skill || "all"} CariReps rule-based skill automation.`
  });

  return sendJson(response, 200, {
    ok: true,
    availableSkills: Object.keys(skillRegistry),
    results
  });
}
