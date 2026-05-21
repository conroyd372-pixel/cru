import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const priceMap = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID,
  yearly: process.env.STRIPE_YEARLY_PRICE_ID
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

  const { plan = "monthly", email } = request.body || {};
  const price = priceMap[plan];

  if (!price) {
    return response.status(400).json({ error: "Choose a valid plan." });
  }

  const origin = request.headers.origin || "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    line_items: [{ price, quantity: 1 }],
    success_url: `${origin}/?checkout=success#join`,
    cancel_url: `${origin}/?checkout=cancel#join`,
    metadata: { plan }
  });

  return response.status(200).json({ url: session.url });
}
