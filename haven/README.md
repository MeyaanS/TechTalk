# Haven (milestone 1: setup, login, guest mode)

Haven helps people in wildfire-risk areas prepare their home and household.
This milestone includes the project setup, passwordless login, "Skip for now" guest mode, and guest-to-account merge.

## 1. Install the tools
- **Node.js 20 or newer**: https://nodejs.org (check with `node -v`)
- **Python 3.11 or newer**: https://python.org (not used until the alerts milestone)
- **VS Code** (optional): open this folder; accept the recommended extensions.

## 2. Install dependencies
```
npm install
```

## 3. Create your .env file
```
cp .env.example .env
```
Open `.env` and set `AUTH_SECRET` (run `npx auth secret`, or `openssl rand -base64 32`, and paste the result).
Leave `DATABASE_URL` as is for development.

## 4. Set up the database
```
npx prisma db push
```
This creates `prisma/dev.db`. Use `npm run db:studio` to look inside it.

## 5. Start the app
```
npm run dev
```
Open http://localhost:3000.

- **Skip for now** starts a guest session.
- **Email me a sign-in link**: in development, the link is printed in the terminal running `npm run dev`. Copy it into your browser.

## 6. Run the tests
```
npm test
```

## Production notes
- Set `RESEND_API_KEY` and `EMAIL_FROM` so magic links are emailed.
- To use Postgres, change `provider` in `prisma/schema.prisma` to `"postgresql"`, set `DATABASE_URL`, and create a fresh migration.
- Set `AUTH_URL` to your public address, and `AUTH_TRUST_HOST=true` if behind a proxy.

## What to check by hand after this milestone
1. Skip for now, then close and reopen the tab: you stay a guest.
2. As a guest, sign in with an email: you land on the home page and the guest reminder disappears.
3. Merge conflict (needs milestone 2 data): both sides have progress, so you get the "Which progress should we keep?" screen.
4. Settings: log out, and "Delete my account and data" for both account and guest.
