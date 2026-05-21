import { calculateMonthlyQuote } from "./_lib/pricing.js";
import { methodNotAllowed, readJson, sendJson } from "./_lib/http.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return methodNotAllowed(response);
  }

  const quote = calculateMonthlyQuote(await readJson(request));
  return sendJson(response, 200, { ok: true, quote });
}
