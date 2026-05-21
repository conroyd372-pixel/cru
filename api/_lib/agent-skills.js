import { calculateMonthlyQuote } from "./pricing.js";
import { serviceCapabilities } from "./service-capabilities.js";

function normalizeList(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
}

function runIntake(payload = {}) {
  const requested = normalizeList(payload.services);
  const requiredCapabilities = requested.length
    ? requested
    : normalizeList(payload.requiredCapabilities);
  const missing = [];

  ["companyName", "email", "agentCount", "agentTier"].forEach((field) => {
    if (!payload[field]) missing.push(field);
  });

  if (String(payload.agentTier).includes("bilingual")) {
    requiredCapabilities.unshift("bilingual_support");
  }

  return {
    skill: "intake-agent",
    requiredCapabilities: [...new Set(requiredCapabilities)],
    missing,
    adminNextAction: missing.length ? "request_missing_information" : "prepare_candidate_matching"
  };
}

function runBilling(payload = {}) {
  const quote = calculateMonthlyQuote(payload);
  const subscriptionActive = payload.subscriptionStatus === "active";

  return {
    skill: "billing-agent",
    canAccessClientTools: subscriptionActive,
    quote,
    adminFlags: subscriptionActive ? [] : ["platform_subscription_required"]
  };
}

function scoreCandidate(candidate, requiredCapabilities, tier) {
  const skills = normalizeList(candidate.skills);
  const matches = requiredCapabilities.filter((capability) => skills.includes(capability));
  const languageFit = tier === "bilingual"
    ? candidate.languageTier === "bilingual"
    : [tier, "bilingual"].includes(candidate.languageTier);
  const utilization = Number(candidate.utilizationRate || 0);
  return matches.length * 10 + (languageFit ? 8 : -10) + Math.max(0, 10 - Math.round(utilization / 10));
}

function runMatching(payload = {}) {
  const requiredCapabilities = normalizeList(payload.requiredCapabilities);
  const tier = payload.agentTier || "english";
  const candidates = Array.isArray(payload.candidates) ? payload.candidates : [];
  const shortlist = candidates
    .map((candidate) => ({
      ...candidate,
      fitScore: scoreCandidate(candidate, requiredCapabilities, tier)
    }))
    .filter((candidate) => candidate.fitScore > 0)
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, Number(payload.agentCount || 3));

  return {
    skill: "matching-agent",
    shortlist,
    adminNextAction: shortlist.length ? "review_shortlist" : "source_more_candidates"
  };
}

function runTaskOperations(payload = {}) {
  const status = payload.status || "not_started";
  const dueDate = payload.dueDate ? new Date(payload.dueDate) : null;
  const overdue = dueDate ? dueDate < new Date() && status !== "completed" : false;

  return {
    skill: "task-operations-agent",
    taskId: payload.taskId || null,
    status,
    overdue,
    adminNextAction: overdue ? "follow_up_on_overdue_task" : "monitor_task"
  };
}

function runIssueTriage(payload = {}) {
  const severity = payload.severity || "normal";
  return {
    skill: "issue-triage-agent",
    priority: severity === "high" ? "urgent" : "standard",
    adminSummary: `${payload.reporterName || "A user"} reported: ${payload.subject || "No subject"}`,
    recommendedOwner: severity === "high" ? "admin" : "operations",
    nextAction: severity === "high" ? "review_immediately" : "place_in_support_queue"
  };
}

function runQuality(payload = {}) {
  const openIssues = Number(payload.openIssues || 0);
  const utilization = Number(payload.utilizationRate || 0);
  const satisfactionFlag = payload.satisfactionFlag || "green";
  const atRisk = satisfactionFlag !== "green" || openIssues > 0;

  return {
    skill: "quality-agent",
    healthStatus: atRisk ? "needs_review" : "healthy",
    renewalRisk: atRisk ? "elevated" : "normal",
    adminRecommendation: utilization > 90
      ? "avoid_new_assignments_until_capacity_is_reviewed"
      : "continue_monitoring"
  };
}

export const skillRegistry = {
  "intake-agent": runIntake,
  "billing-agent": runBilling,
  "matching-agent": runMatching,
  "task-operations-agent": runTaskOperations,
  "issue-triage-agent": runIssueTriage,
  "quality-agent": runQuality
};

export function runSkill(skillName, payload = {}) {
  const runner = skillRegistry[skillName];
  if (!runner) {
    return {
      skill: skillName,
      error: `Unknown skill. Available skills: ${Object.keys(skillRegistry).join(", ")}`
    };
  }
  return runner(payload);
}

export function runAllSkills(payload = {}) {
  return Object.keys(skillRegistry).map((skillName) => runSkill(skillName, payload));
}

export { serviceCapabilities };
