import { auditEvent } from "./_lib/audit.js";
import { methodNotAllowed, readJson, sendJson } from "./_lib/http.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return methodNotAllowed(response);
  }

  const lead = await readJson(request);
  const missing = ["firstName", "lastName", "email", "need"].filter((field) => !lead[field]);
  if (missing.length) {
    return sendJson(response, 400, {
      ok: false,
      message: `Strategy call request is missing: ${missing.join(", ")}.`
    });
  }

  const record = {
    id: `strategy_${Date.now()}`,
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: String(lead.email).trim().toLowerCase(),
    website: lead.website || null,
    country: lead.country || null,
    need: lead.need,
    candidateCount: Number(lead.candidateCount || 1),
    contactMethod: lead.contactMethod || "Email",
    status: "sent_to_admin_center",
    createdAt: new Date().toISOString()
  };

  auditEvent({
    type: "strategy_call_requested",
    severity: "info",
    actorName: `${record.firstName} ${record.lastName}`,
    actorRole: "prospect",
    entityType: "strategy_call",
    entityId: record.id,
    plainEnglish: `${record.firstName} ${record.lastName} requested a strategy call for ${record.need} with ${record.candidateCount} candidate(s).`
  });

  return sendJson(response, 200, { ok: true, strategyCall: record });
}
