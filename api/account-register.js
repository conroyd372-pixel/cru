import { auditEvent } from "./_lib/audit.js";
import { methodNotAllowed, readJson, sendJson } from "./_lib/http.js";
import { roles } from "./_lib/auth.js";

const publicRoles = new Set([roles.CLIENT, roles.COMPANY_ADMIN, roles.TALENT_APPLICANT]);

function cleanEmail(email = "") {
  return String(email).trim().toLowerCase();
}

function validateRegistration(input) {
  const missing = ["name", "email", "role"].filter((field) => !input[field]);
  if (missing.length) {
    return `Account registration is missing: ${missing.join(", ")}.`;
  }

  if (!cleanEmail(input.email).includes("@")) {
    return "Please use a valid Gmail or Google Workspace email address.";
  }

  if (input.role !== roles.ADMIN && !publicRoles.has(input.role)) {
    return "Choose client, company admin, or talent applicant for this account.";
  }

  return null;
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return methodNotAllowed(response);
  }

  const input = await readJson(request);
  const validationError = validateRegistration(input);
  if (validationError) {
    return sendJson(response, 400, { ok: false, message: validationError });
  }

  if (input.role === roles.ADMIN) {
    const inviteCode = request.headers["x-admin-invite-code"];
    if (!process.env.ADMIN_INVITE_CODE || inviteCode !== process.env.ADMIN_INVITE_CODE) {
      return sendJson(response, 403, {
        ok: false,
        message: "Admin accounts require an owner-approved invite code."
      });
    }
  }

  const email = cleanEmail(input.email);
  const isTalent = input.role === roles.TALENT_APPLICANT;
  const isClient = input.role === roles.CLIENT || input.role === roles.COMPANY_ADMIN;
  const account = {
    id: `user_${Date.now()}`,
    name: input.name,
    email,
    role: input.role,
    companyName: input.companyName || null,
    authProvider: input.authProvider || "google",
    subscriptionStatus: isClient ? "payment_required" : "not_required",
    paywallRequired: isClient,
    nextStep: isTalent ? "submit_talent_application" : "activate_membership",
    createdAt: new Date().toISOString()
  };

  if (input.role === roles.ADMIN) {
    account.subscriptionStatus = "not_required";
    account.paywallRequired = false;
    account.nextStep = "open_admin_dashboard";
  }

  auditEvent({
    type: "account_registered",
    severity: "info",
    actorUserId: account.id,
    actorName: account.name,
    actorRole: account.role,
    companyId: input.companyId || null,
    entityType: "account",
    entityId: account.id,
    plainEnglish: `${account.name} created a ${account.role} account using ${account.authProvider}.`
  });

  return sendJson(response, 200, { ok: true, account });
}
