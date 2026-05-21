export const pricing = {
  platformSubscriptionMonthly: 10,
  agentMonthly: {
    english: 10,
    spanish: 10,
    bilingual: 12
  },
  minimumServiceMonths: 1
};

export const agentTierLabels = {
  english: "English Only",
  spanish: "Spanish Only",
  bilingual: "Bilingual (English & Spanish)"
};

export function normalizeAgentTier(tier = "english") {
  return pricing.agentMonthly[tier] ? tier : "english";
}

export function calculateMonthlyQuote({
  agentCount = 0,
  agentTier = "english",
  serviceMonths = 1,
  serviceModel = "fixed"
} = {}) {
  const tier = normalizeAgentTier(agentTier);
  const count = Math.max(0, Number.parseInt(agentCount, 10) || 0);
  const months = Math.max(pricing.minimumServiceMonths, Number.parseInt(serviceMonths, 10) || 1);
  const agentRate = pricing.agentMonthly[tier];
  const monthlyTotal = pricing.platformSubscriptionMonthly + count * agentRate;

  return {
    platformSubscriptionMonthly: pricing.platformSubscriptionMonthly,
    agentTier: tier,
    agentTierLabel: agentTierLabels[tier],
    agentRateMonthly: agentRate,
    agentCount: count,
    serviceMonths: serviceModel === "ongoing" ? null : months,
    serviceModel: serviceModel === "ongoing" ? "ongoing" : "fixed",
    monthlyTotal,
    firstCycleDueToday: monthlyTotal,
    billingPolicy: "Pre-paid monthly billing. Any use during a billing cycle counts as a completed full month with no prorated refunds or partial credits."
  };
}
