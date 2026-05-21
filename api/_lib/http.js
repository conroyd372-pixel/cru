export async function readJson(request) {
  if (request.body && typeof request.body === "object") {
    return request.body;
  }

  const chunks = [];
  for await (const chunk of request) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  if (!chunks.length) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export function sendJson(response, status, body) {
  response.status(status).json(body);
}

export function methodNotAllowed(response, methods = "POST") {
  response.setHeader("Allow", methods);
  sendJson(response, 405, {
    ok: false,
    message: "This action is not available from this page."
  });
}

