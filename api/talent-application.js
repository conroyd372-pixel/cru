import { auditEvent } from "./_lib/audit.js";
import { methodNotAllowed, readJson, sendJson } from "./_lib/http.js";
import { hasRequiredCapability, serviceCapabilities } from "./_lib/service-capabilities.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return methodNotAllowed(response);
  }

  const application = await readJson(request);
  const required = ["name", "email", "country", "skills"];
  const missing = required.filter((field) => !application[field]);

  if (missing.length) {
    return sendJson(response, 400, {
      ok: false,
      message: `Talent application is missing: ${missing.join(", ")}.`
    });
  }

  if (!hasRequiredCapability(application.skills)) {
    return sendJson(response, 400, {
      ok: false,
      message: "Talent application must include at least one CariReps service capability.",
      requiredCapabilities: serviceCapabilities
    });
  }

  const record = {
    id: `talent_${Date.now()}`,
    status: "new_application",
    paywallRequired: false,
    ...application,
    createdAt: new Date().toISOString()
  };

  auditEvent({
    type: "talent_application_submitted",
    severity: "info",
    actorName: application.name,
    actorRole: "talent_applicant",
    entityType: "talent_application",
    entityId: record.id,
    plainEnglish: `${application.name} submitted a talent application. No payment required.`
  });

  return sendJson(response, 200, { ok: true, application: record });
}
