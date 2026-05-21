import { auditEvent } from "./_lib/audit.js";
import { getCurrentUserContext, requireRole, roles } from "./_lib/auth.js";
import { methodNotAllowed, readJson, sendJson } from "./_lib/http.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return methodNotAllowed(response);
  }

  const talent = getCurrentUserContext(request);
  const roleCheck = requireRole(talent, [roles.TALENT, roles.ADMIN]);
  if (!roleCheck.ok) {
    return sendJson(response, roleCheck.status, roleCheck);
  }

  const task = await readJson(request);
  if (!task.taskId || !task.status) {
    return sendJson(response, 400, {
      ok: false,
      message: "Task update needs a task ID and status."
    });
  }

  const record = {
    id: `task_update_${Date.now()}`,
    taskId: task.taskId,
    projectId: task.projectId || null,
    companyId: task.companyId || talent.companyId || null,
    updatedBy: talent.displayName,
    status: task.status,
    completedAt: task.status === "completed" ? new Date().toISOString() : null,
    notes: task.notes || "",
    createdAt: new Date().toISOString()
  };

  auditEvent({
    type: "task_status_updated",
    severity: task.status === "completed" ? "info" : "normal",
    actorUserId: talent.userId,
    actorName: talent.displayName,
    actorRole: talent.role,
    companyId: record.companyId,
    entityType: "task",
    entityId: task.taskId,
    plainEnglish: `${talent.displayName} marked task ${task.taskId} as ${task.status}.`
  });

  return sendJson(response, 200, { ok: true, taskUpdate: record });
}
