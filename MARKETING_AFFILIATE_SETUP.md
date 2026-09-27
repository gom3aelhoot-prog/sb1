# SB1 Marketing & Affiliate Setup

## Affiliate matrix
- 5 levels by default.
- Commissions are calculated from qualified sales/services, not from recruitment alone.
- Referral links use `/register?ref=CODE`.
- Registered clients/institutions are added to `affiliate_members`.
- Dashboard: `/referral/tree`.

## Marketing channels
The server adapter supports:
- Telegram Bot API
- WhatsApp Cloud API
- Facebook Page Graph API
- Instagram Business/Creator Graph API
- Email via Resend

The website never stores provider secrets in browser code.

## Vercel environment variables
Set these in the SB1 Vercel project:
```
MARKETING_AUTOMATION_SECRET=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BROADCAST_TO=
FACEBOOK_PAGE_ACCESS_TOKEN=
FACEBOOK_PAGE_ID=
INSTAGRAM_ACCESS_TOKEN=
INSTAGRAM_BUSINESS_ACCOUNT_ID=
RESEND_API_KEY=
NEWSLETTER_FROM_EMAIL=
NEWSLETTER_SUBJECT=
NEWSLETTER_HTML=
CRON_SECRET=
SUPABASE_SERVICE_ROLE_KEY=
```

## Automatic publishing
Content approved by the SB1 moderation screen calls `/api/marketing/publish`.
The same endpoint can be used by future article/news/app/game publishing workflows.

## Weekly newsletter
Vercel Cron calls `/api/marketing/weekly-newsletter` every Monday at 09:00 UTC.
Only active rows in `newsletter_subscribers` are mailed.

## Required provider accounts
No social/email provider account is created automatically by the repository. The owner must own/authorize the relevant official accounts and place their credentials in Vercel Environment Variables. This is intentional so SB1 never invents or impersonates an external account.
