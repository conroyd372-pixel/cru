# CariReps Vercel Deployment

## Stack

- Frontend: Vercel static site
- Backend/API: Vercel Functions
- Payments: Stripe Checkout subscriptions
- Database: Supabase or Neon
- Images/media: Cloudinary
- Heavy backend later: Render

## Deploy

1. Push this folder to GitHub.
2. Import the repository into Vercel.
3. Add environment variables from `.env.example`.
4. Create Stripe products:
   - Starter Network monthly: `$19/month`
   - Starter Network yearly: `$190/year`
5. Add the Stripe price IDs to Vercel.
6. Point Stripe webhook to `/api/stripe-webhook`.
7. Connect Supabase or Neon after the first public site deploy.

## Current API Stubs

- `GET /api/health`
- `POST /api/create-checkout-session`
- `POST /api/stripe-webhook`
