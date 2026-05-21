import { getCurrentUserContext } from "./_lib/auth.js";
import { sendJson } from "./_lib/http.js";

export default function handler(request, response) {
  const user = getCurrentUserContext(request);

  sendJson(response, 200, {
    ok: true,
    user,
    portals: {
      client: ["company_admin", "client"].includes(user.role),
      talent: ["talent", "talent_applicant"].includes(user.role),
      admin: user.role === "admin"
    }
  });
}

