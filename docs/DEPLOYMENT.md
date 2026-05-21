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
   - Platform Access: `$10/month`
   - English Only Agent: `$10/agent/month`
   - Spanish Only Agent: `$10/agent/month`
   - Bilingual Agent: `$12/agent/month`
5. Add the Stripe price IDs to Vercel.
6. Point Stripe webhook to `/api/stripe-webhook`.
7. Connect Supabase or Neon after the first public site deploy.

## Current API Stubs

- `GET /api/health`
- `POST /api/create-checkout-session`
- `POST /api/stripe-webhook`
- `POST /api/pricing-quote`
- `POST /api/admin-promotions`
- `GET /api/admin-analytics`
- `POST /api/issue-report`
- `POST /api/task-update`
- `POST /api/internal-email`
- `POST /api/strategy-call`
- `POST /api/agentic-runner`
