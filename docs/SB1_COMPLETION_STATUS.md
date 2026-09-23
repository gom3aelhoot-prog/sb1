# SB1 Completion Status

This branch preserves the local-design shell and the existing 11-language platform.

## Existing in SB1
- Local-design home/header/footer and hash pages.
- Platform routes for doctors, questions/ask, articles/video/audio, courses, sessions, facilities, tests, jobs, referrals, AI reader, favorites, chat, library/planner, registration/subscriptions and admin.
- 11-language platform i18n.
- Country/currency pricing foundations.
- Question pricing tiers and weekly compounder system.
- Platform-owned content revenue ledger and wallet primitives.
- Medical/psychological specialty migrations.

## Added in this completion pass
The migration `20260923020000_sb1_completion_foundation.sql` adds database foundations for:
- first-signup 10% promotion;
- payment holds, split calculation and compensation rules;
- marketplace listings, protected phone reveal and marketplace messages;
- live tracking sessions/events;
- doctor/facility verification, e-signature and contracts;
- long-term session requests and open/hidden bids;
- complaints, provider penalties and discount codes;
- affiliate tree and marketing campaigns;
- media bank, specialist badges and specialist AI sessions;
- expiring secure download tokens;
- owner controls, content backups, health monitoring and supervisor rooms;
- tax profiles, gifts and payment sandbox configuration;
- global/private notification channels;
- sb1.com watermark and feature-switch defaults.

## Not claimed here
The migration is a schema/control foundation. It does not by itself claim that every workflow is fully wired into a production payment provider, identity/face-verification vendor, email provider, map provider, or AI provider. Those integrations require provider credentials and deployment configuration.

## Safety
SB2 is not included or modified.
