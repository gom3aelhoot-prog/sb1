# SB1 production activation

## Free / no-key integrations already wired
- Supabase has a free tier for the database/auth/storage baseline; add the two VITE_SUPABASE variables in Vercel to move persistence from browser demo storage to shared production data.
- Jitsi Meet is used for video-session rooms without requiring SB1 to pay a video SDK fee. The session record stores the generated meeting URL.

## Commission-based payments
SB1 now has a Vercel server endpoint at /api/create-checkout for Stripe Checkout + Stripe Connect destination charges.

Add these server-side Vercel Environment Variables:
- STRIPE_SECRET_KEY
- STRIPE_CONNECT_ACCOUNT_ID
- SB1_PLATFORM_FEE_PERCENT (example: 20)
- SB1_PUBLIC_URL

Then redeploy. Do not put Stripe secrets in VITE_* variables.

The checkout endpoint only becomes live when the Stripe secret exists; otherwise SB1 keeps its sandbox flow and does not claim that money was charged.

## Current limitations requiring external provider approval/credentials
- Government/identity verification provider: no free universal provider is available without an account/verification service contract.
- Real medical AI analysis: requires a configured AI model/provider and should not be presented as diagnosis.
- SMS/WhatsApp notifications: require a messaging provider account.
- Pharmacy delivery: requires a real pharmacy/delivery partner or logistics API.
- Production-grade multi-provider payouts require verified Stripe Connect accounts for each specialist/institution.
