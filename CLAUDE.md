# GradPath — Project Context

Graduate-school application tracker SaaS. Solo founder (Korede, product designer). Pre-launch, free-first strategy.
Live at grad-path-jmem.vercel.app (Vercel project `grad-path-jmem`, auto-deploys on push to `main`).

## Stack
- Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind-adjacent custom CSS files per page
- Clerk v7 auth (`await clerkClient()` pattern), Prisma 5.22 → Supabase Postgres (project `tvjnodzpybqmqcvfeaqv`, **eu-central-1 Frankfurt**)
- Supabase Storage: private `documents` bucket (10MB, PDF/DOC/DOCX only)
- Anthropic API for AI Review (`/api/ai/review`) — structured JSON review of SOPs/CVs
- Flutterwave for payments (schema + webhook stub exist; **no end-to-end flow built yet — deliberately deferred until post-launch demand**)

## Critical operational facts
- Vercel Function Region MUST stay **Frankfurt (fra1)** — DB is in eu-central-1; moving regions reintroduces 1-3s latency on every query (this was a major bug, already fixed).
- `npm run build` must pass before any push. Never push a red build.
- Two lockfiles warning in builds is known/benign (`/Users/kodal/package-lock.json` + repo one).
- `.env*` is gitignored. Secrets were rotated after an early leak — never commit or print secrets.
- `.landing-backup/` at repo root is a manual backup of the old landing; not for committing.

## Product structure
- Route groups: `(app)` = authed pages (dashboard, applications, tasks, documents, ai-review, settings), `(auth)` = sign-in/up, root `page.tsx` = public landing, `/privacy` + `/terms` = static legal pages.
- Landing = 3 files in `src/components/landing/`: `markup.ts` (LANDING_HTML template literal — beware backticks/`${}`), `landing.css` (EVERY selector scoped under `.gp-land` — keep it that way, zero leakage), `LandingClient.tsx` (nav scroll `gp-nav`, mobile toggle `gp-navToggle`, `.reveal` observer, hero typewriter `gp-typed`, task loop `#mockTasks`).
- Landing brand: blue `#3F75FF` (`--blue`), Inter (inherited from next/font — do NOT re-import Google Fonts), tight tracking (-1px body, -2/-3px headings).
- In-app brand: navy `#1B2B5E`, amber `#F5A623`, off-white `#F9F8F6` (cap.so-inspired white/airy redesign, complete on all six screens).
- Application viewing/editing happens ONLY via the shared `AppDrawer` (`src/components/appShared.tsx`). `/applications/[id]` is a redirect to `/applications?open={id}`. URL params: `?add=1` opens add-drawer, `?open={id}` opens that app's drawer (both self-clean via replaceState).
- AppDrawer has optional `onDeleteApp` prop → delete-with-confirm (wired on Applications page).

## Business rules
- FREE_PLAN_LIMITS (src/lib/utils.ts): 5 applications, 3 AI reviews/day. Enforced SERVER-SIDE in `/api/applications` POST and `/api/ai/review` — never weaken; UI checks are secondary.
- Plans: FREE | PRO. Pro is "coming soon" everywhere (₦5,000/month planned). Upgrade buttons = toast, waitlist → /sign-up.
- Users own their content; AI Review sends doc text to Anthropic only on request (privacy policy commits to this).

## Current state (July 2026)
DONE: six-screen app redesign wired to real data · premium landing (typing hero, animated mock, flags row) + perf pass (reduced-motion, ≤480px stability) · legal pages linked · server-side limits verified · storage bucket live · delete application · fluid card grids (auto-fit, minmax 320px) · scattered detail page retired.

## Pending / next
1. **Fresh-user walkthrough** (in progress): new email, incognito — empty states, onboarding, add→tasks→upload→delete, 6th-app limit msg, settings save/export/signout, AI Review must fail CLEANLY (no credit yet).
2. **Anthropic credit** — card arriving; fund console.anthropic.com (~$5) + confirm `ANTHROPIC_API_KEY` in Vercel prod env. AI Review errors until then (expected).
3. **Launch** (free-first, payments deferred).
4. Post-launch: Flutterwave subscription build in TEST MODE first (checkout → webhook signature verification → plan lifecycle incl. downgrade at planExpiresAt), flip to live keys on demand signal. Start Flutterwave KYC verification early — it's the slow pole.
5. Optional: custom domain (Vercel → Domains, then update Clerk allowed origins).

## Conventions
- Small, verified changes: build green → then commit → then push.
- Prisma: use nested `include` queries (single round-trip) — pages were optimized away from double-query pattern; don't regress.
- pip not relevant; this is a pure Node project.
