# Haven: project rules for Claude Code

Haven helps homeowners and renters in wildfire-risk areas prepare their property
and household, and turns official fire-weather alerts into clear personal action.

## Stack
- JavaScript only (no TypeScript). Next.js 14 App Router, React, Tailwind CSS. JSDoc comments on exported functions.
- Auth.js v5 (next-auth beta) with passwordless email magic links. Guest mode via httpOnly cookie.
- Database: Prisma ORM only (no raw SQL). SQLite in development. For Postgres: change `provider` in prisma/schema.prisma and DATABASE_URL.
- 3D (milestone 2): react-three-fiber + drei. Alerts and background jobs (milestone 3+): Python scripts in /worker. SMS: Twilio. Push: Web Push.

## Folder layout
- `prisma/schema.prisma`: all tables. Every user-owned table has `userId` OR `guestId` (the "owner pattern").
- `src/auth.js`: Auth.js setup. `src/lib/currentUser.js`: THE ONLY way to find the current user/guest.
- `src/lib/mergeGuest.js`: transactional guest -> account merge. `src/lib/guest.js`: guest cookie helpers.
- `src/app/`: pages and server actions (`actions.js`). `src/components/`: shared UI. `tests/`: Vitest. `worker/`: Python (later).

## Commands
- `npm install`, `npx prisma db push` (create/update the dev database), `npm run dev`, `npm test`, `npm run db:studio`.

## Rules (apply in every session)
1. Never invent safety data, thresholds, official routes, or alert text. Show source and last-updated time on all live data. Show a clear "data unavailable" state when an API fails.
2. No mock data in the app. Tests may use recorded real API responses, labeled as fixtures.
3. Never present a suggested route as official. Suggested routes always carry the "NOT an official evacuation route" notice.
4. SMS is opt-in only. Never require a phone number. Quiet hours never block Red Flag Warnings or Emergency alerts. Encrypt phone numbers at rest.
5. Every page has the footer: "Haven is a planning aid, not an official emergency service. In an emergency, call 911."
6. Accessibility: WCAG 2.2 AA, visible focus, keyboard navigation, aria-live for alerts, never color alone, reduced motion, plain language (about 8th-grade level). Alert colors are reserved for alert states.
7. Follow NWS API rules: User-Agent header, caching, rate limits.
8. Secrets live in .env only (never committed). Keep `.env.example` up to date.
9. Work one milestone at a time: run tests, commit, summarize, then stop for review.
10. If a requirement is ambiguous or a service needs an account or key, ask. Do not assume or fake it.
