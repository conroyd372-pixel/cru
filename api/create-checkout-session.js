import Stripe from "stripe";
import { calculateMonthlyQuote } from "./_lib/pricing.js";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-02-25.clover" })
  : null;

const priceMap = {
  base: process.env.STRIPE_BASE_SUBSCRIPTION_PRICE_ID || process.env.STRIPE_MONTHLY_PRICE_ID,
  english: process.env.STRIPE_AGENT_ENGLISH_PRICE_ID,
  spanish: process.env.STRIPE_AGENT_SPANISH_PRICE_ID,
  bilingual: process.env.STRIPE_AGENT_BILINGUAL_PRICE_ID
};

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  if (!stripe) {
    return response.status(503).json({
      error: "Payments are not configured yet."
    });
  }

  const checkout = request.body || {};
  const { email } = checkout;
  const quote = calculateMonthlyQuote(checkout);
  const lineItems = [{ price: priceMap.base, quantity: 1 }];

  if (!priceMap.base) {
    return response.status(400).json({ error: "Base subscription price is not configured." });
  }

  if (quote.agentCount > 0) {
    const agentPrice = priceMap[quote.agentTier];
    if (!agentPrice) {
      return response.status(400).json({ error: `Stripe price missing for ${quote.agentTierLabel} agents.` });
    }
    lineItems.push({ price: agentPrice, quantity: quote.agentCount });
  }

  const origin = request.headers.origin || "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    line_items: lineItems,
    success_url: `${origin}/?checkout=success#join`,
    cancel_url: `${origin}/?checkout=cancel#join`,
    subscription_data: {
      metadata: {
        agentCount: String(quote.agentCount),
        agentTier: quote.agentTier,
        serviceModel: quote.serviceModel,
        serviceMonths: quote.serviceMonths ? String(quote.serviceMonths) : "ongoing",
        billingPolicy: "prepaid_full_cycle_no_proration"
      }
    },
    metadata: {
      monthlyTotal: String(quote.monthlyTotal),
      firstCycleDueToday: String(quote.firstCycleDueToday),
      agentTier: quote.agentTier,
      agentCount: String(quote.agentCount)
    }
  });

  return response.status(200).json({ url: session.url });
}
