import { getCurrentUserContext, requireRole, roles } from "./_lib/auth.js";
import { methodNotAllowed, sendJson } from "./_lib/http.js";

export default async function handler(request, response) {
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
    metrics: {
      registeredClients: 318,
      activeClients: 74,
      activeEmployeesInUse: 186,
      averageAgentUtilizationRate: "82%",
      clientSatisfactionFlags: 5
    },
    clientAgentLedger: [
      {
        clientId: "horizon-dental",
        clientName: "Horizon Dental Group",
        activeEmployees: [
          { talentUserId: "talent_ana", fullName: "Ana Rivera", communicationType: "Bilingual (English & Spanish)", utilizationRate: "88%" },
          { talentUserId: "talent_marcus", fullName: "Marcus Johnson", communicationType: "English Only", utilizationRate: "76%" }
        ],
        contractRenewalDate: "2026-07-01",
        satisfactionFlag: "green"
      },
      {
        clientId: "mason-legal",
        clientName: "Mason Legal Intake",
        activeEmployees: [
          { talentUserId: "talent_elena", fullName: "Elena Park", communicationType: "Spanish Only", utilizationRate: "91%" }
        ],
        contractRenewalDate: "2026-06-15",
        satisfactionFlag: "yellow"
      }
    ]
  });
}
