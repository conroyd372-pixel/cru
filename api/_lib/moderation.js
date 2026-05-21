const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const phonePattern = /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g;

export function inspectMessage(body = "") {
  const violations = [];

  if (body.match(emailPattern)) {
    violations.push("email_address");
  }

  if (body.match(phonePattern)) {
    violations.push("phone_number");
  }

  return {
    allowed: violations.length === 0,
    violations,
    safeBody: body
      .replace(emailPattern, "[email blocked]")
      .replace(phonePattern, "[phone blocked]")
  };
}

export function buildModerationReport({ user, body, threadId, companyId, violations }) {
  return {
    type: "message_policy_violation",
    severity: "high",
    actorUserId: user.userId,
    actorName: user.displayName,
    actorRole: user.role,
    companyId,
    threadId,
    action: "blocked_contact_sharing_attempt",
    plainEnglish: `${user.displayName} attempted to send ${violations.join(" and ")} in a message. The message was blocked before delivery.`,
    attemptedMessage: body,
    createdAt: new Date().toISOString()
  };
}
