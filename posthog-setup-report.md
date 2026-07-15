# PostHog post-wizard report

The wizard has completed a deep integration of this Next.js App Router project with PostHog. It installed the browser and server SDKs, initialized client-side capture in `instrumentation-client.ts`, added a reusable server capture helper in `src/lib/posthog-server.ts`, configured a Next.js `/ingest` reverse proxy in `next.config.ts`, wrote the required PostHog environment variables to `.env.local`, and added targeted client-side and server-side instrumentation around onboarding, applications, documents, tasks, profile updates, preferences, exports, checkout, and billing webhooks.

| Event name | Description | File |
| --- | --- | --- |
| onboarding_completed | Captured when a signed-in applicant completes onboarding. | `src/app/api/users/onboarding/route.ts` |
| application_created | Captured when a user adds a new university application. | `src/app/api/applications/route.ts` |
| document_uploaded | Captured when a user uploads or replaces an application document. | `src/app/api/documents/route.ts` |
| payment_checkout_started | Captured when a user starts the Pro checkout flow. | `src/app/api/payments/initiate/route.ts` |
| payment_completed | Captured when Flutterwave confirms a successful payment. | `src/app/api/webhooks/flutterwave/route.ts` |
| task_created | Captured when a user creates a custom application task. | `src/app/api/tasks/route.ts` |
| task_completion_updated | Captured when a user marks an application task complete or incomplete. | `src/app/api/tasks/[id]/route.ts` |
| profile_updated | Captured when a user saves a profile name change. | `src/app/api/users/profile/route.ts` |
| preferences_updated | Captured when a user updates notification preferences. | `src/app/api/users/preferences/route.ts` |
| data_export_requested | Captured when a user requests an account data export. | `src/app/api/users/export/route.ts` |
| account_deleted | Captured when a user deletes their account. | `src/app/api/users/account/route.ts` |

## Next steps

We've built some insights and a dashboard for monitoring the newly instrumented behavior:

- [Analytics basics (wizard)](https://us.posthog.com/project/513744/dashboard/1853162)
- [Onboarding completions (wizard)](https://us.posthog.com/project/513744/insights/JKGHg9y2)
- [Applications created by country (wizard)](https://us.posthog.com/project/513744/insights/V36QfjAj)
- [Document uploads by type (wizard)](https://us.posthog.com/project/513744/insights/Gn2wkXEn)
- [Upgrade checkout to payment completion (wizard)](https://us.posthog.com/project/513744/insights/m3QWvWDR)
- [Task completion updates (wizard)](https://us.posthog.com/project/513744/insights/ZHxt26bA)

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add the exact PostHog env var names added here (`NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`, `NEXT_PUBLIC_POSTHOG_HOST`) to `.env.example` and any bootstrap scripts used by collaborators.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.
- [ ] Confirm the returning-visitor path also calls `identify` — a handler that only identifies on fresh login can leave returning sessions on anonymous distinct IDs.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
