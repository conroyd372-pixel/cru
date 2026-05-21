import { auditEvent } from "./_lib/audit.js";
import { getCurrentUserContext, requireRole, roles } from "./_lib/auth.js";
import { methodNotAllowed, readJson, sendJson } from "./_lib/http.js";

const discountTypes = new Set(["percentage", "fixed_amount", "free_trial"]);

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return methodNotAllowed(response);
  }

  const admin = getCurrentUserContext(request);
  const roleCheck = requireRole(admin, [roles.ADMIN]);
  if (!roleCheck.ok) {
    return sendJson(response, roleCheck.status, roleCheck);
  }

  const promotion = await readJson(request);
  if (!promotion.name || !discountTypes.has(promotion.discountType)) {
    return sendJson(response, 400, {
      ok: false,
      message: "Promotion needs a name and a valid discount type: percentage, fixed_amount, or free_trial."
    });
  }

  const record = {
    id: `promo_${Date.now()}`,
    name: promotion.name,
    discountType: promotion.discountType,
    amount: Number(promotion.amount || 0),
    trialDays: Number(promotion.trialDays || 0),
    targetClientId: promotion.targetClientId || null,
    reason: promotion.reason || "Flexible offer",
    status: promotion.status || "active",
    createdAt: new Date().toISOString()
  };

  auditEvent({
    type: "promotion_created",
    severity: "info",
    actorUserId: admin.userId,
    actorName: admin.displayName,
    actorRole: admin.role,
    entityType: "promotion",
    entityId: record.id,
    plainEnglish: `${admin.displayName} created promotion "${record.name}" for ${record.discountType}.`
  });

  return sendJson(response, 200, { ok: true, promotion: record });
}
