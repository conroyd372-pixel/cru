import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export const config = {
  api: {
    bodyParser: false
  }
};

async function readBuffer(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).send("Method not allowed");
  }

  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return response.status(503).send("Stripe webhook not configured");
  }

  const signature = request.headers["stripe-signature"];
  const body = await readBuffer(request);

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return response.status(400).send(`Webhook error: ${error.message}`);
  }

  // TODO: write subscription events to Supabase or Neon once the database is connected.
  return response.status(200).json({ received: true, type: event.type });
}
