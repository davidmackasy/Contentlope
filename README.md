# ContentPilot

A working first release of the brand-aware social content studio described in the supplied PRD. Carousels are the primary workflow; video is secondary. React, TypeScript and Vinext run on a Cloudflare Worker, with D1 persistence and private R2 media storage.

## Available now

- Landing page, email/password sessions, account profile, resumable six-step onboarding and optional ChatGPT/Google sign-in.
- Isolated business profiles with editable Brand Brain, brand kit, preferences and website analysis proposals that require user review.
- Asset uploads with original, optimized and thumbnail variants, private access, categories, tags and favorites.
- Persisted staged carousel generation, retries, exact numbered story counts, brand-grounded guided drafts without API keys, duplicate-topic checks and shared slide styling.
- Editable slide text, assets, layouts, crops, alignment, typography, reorder, duplicate and delete. Optimistic revision checks protect autosave. Major rewrites keep restorable versions.
- Caption/hashtag controls and full-resolution JPEG carousel ZIP export. Rendered slides are stored before social publishing.
- Library, calendar, timezone-aware planning, cancellation and rescheduling. TikTok and Instagram OAuth/publishing adapters, durable publication records and interrupted-submission review to prevent blind duplicate retries.
- Stripe checkout, portal, invoices and signed, deduplicated subscription webhooks; plan entitlements and usage records.
- Video storyboard creation; a custom video provider contract supports job submission, status checking, private MP4 storage and playback.
- Instagram analytics sync foundation and verified-email admin allowlist with operational tables, plan/model editing and audit events.

No production users, assets or successful social posts are seeded. Browser QA data exists only in the ignored local database.

## Local development

Use Node >=22.13.0, npm and Git.

```sh
npm ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_wooden_wendell_rand.sql
npm run dev
```

Apply the migration once to a new local database. Do not replay it against existing data. The dev URL is printed by Vite. `.wrangler/`, `.sites-runtime/`, dependencies and builds stay untracked. Production migrations are shipped in `drizzle/`.

```sh
npm test
npm run typecheck
npm run build
```

The integration suite uses the actual migration and SQLite with D1/R2 adapters. It verifies isolation, authentication, staged retries, autosave revisions, calendar state, unavailable integrations, confirmed publishing and ambiguous-submit protection. External provider responses are mocked in tests; tests do not establish live platform approval.

## Production configuration

`.openai/hosting.json` retains the existing private Sites project. Set runtime credentials through Sites environment variables, marking secrets as secret; never commit keys. See `.env.example` for names.

- `APP_URL` is the production origin. `TOKEN_ENCRYPTION_KEY` is a random 32-byte base64 secret for social token encryption. Changing it requires reconnecting social accounts.
- Email: `MAIL_API_KEY`, `MAIL_FROM`; the default adapter uses Resend's email API. Verification and reset flows report unavailable delivery until configured.
- Google: client ID/secret, callback `/api/auth/google/callback`.
- AI text and image: OpenAI-compatible base URLs, keys and models. Text uses JSON chat completions; image generation/editing expects base64 output. Without keys, drafts are explicitly labeled guided and image generation is unavailable.
- Video: custom service `POST /generate` returning `{id}`, then `GET /jobs/:id` returning `{status,output_url?,error?}`. States are `pending`, `processing`, `completed`, `failed`; completion must supply a public HTTPS MP4. It requires a separately implemented provider service following this contract. Video social publishing is not included in this release.
- Stripe: secret/webhook keys and Creator/Growth price IDs. Configure signed webhook destination `/api/webhooks/stripe`. Prices displayed in the app come from its plans table; align those with Stripe prices.
- TikTok/Instagram: developer app credentials, approved scopes and callback URLs `/api/social/callback/tiktok` and `/api/social/callback/instagram`. Platform review, business-account eligibility and public media URL verification remain external prerequisites.
- Scheduler: configure an authenticated recurring trigger to `POST /api/internal/tick` with `Authorization: Bearer <SCHEDULER_SECRET>` every minute. Verify that it runs before setting `SCHEDULER_ENABLED=true`. With scheduling disabled, Calendar can save a plan but does not promise unattended social publication. The worker preserves provider IDs and requires review after an ambiguous submission.
- Admin: `ADMIN_EMAILS` comma-separated allowlist; app email verification is required as well.

## Remaining production work

This is a first release, not the completion of every future-facing PRD feature. Live provider verification, scheduler provisioning, video provider service and video publishing need completion/configuration. Team invitations/roles beyond owner access, sophisticated semantic/vision slide QA, complete TikTok analytics and conversion attribution, configurable template rendering and a production observability/alerting service remain follow-up work. Website analysis and guided draft copy should be reviewed before posting. Legal copy is initial product copy and needs business-specific review before public launch.

The source and database deliberately distinguish draft, generating, planned, scheduled, publishing, failed and published states. Unavailable integrations never create fabricated success records.

## Website branding and native social slides

Website onboarding reads public HTML, linked CSS and bounded CSS imports to find the logo, palette, heading/body fonts, business metadata and usable photographs. Imported assets remain private to the business and are deduplicated. Successful fields are applied automatically; missing items have manual fallbacks. JavaScript-only sites and inaccessible resources can produce partial imports.

The composer offers photo stories, large editable text, and AI photos. Text layers remain editable with placement, outline/label/clean treatments, color, weight, size and optional branding. Preview and export share the slide presentation settings. AI photos use OpenAI GPT Image 2.5 Flare; reference edits use Sunburst. Live AI requires the configured API key; tests mock provider calls.

Validation: TypeScript check and 17 integration tests pass, including brand asset isolation, font import, editable slide persistence and OpenAI generation/edit requests. Local browser verification created and customized a bold-text draft.
