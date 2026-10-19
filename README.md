# The One-Line Wall

> Add one line. See what we make.

Whiteboards where students walk by, with one rule: you get one line. Connect it to someone else's or start something new. This is the landing page for the project, made by W&L students for W&L students in BUS 3340: Design Thinking.

## What's on the site

| Page | What it does |
| --- | --- |
| `/` | Hero time-lapse from the Commons booth, how it works, the problem, a "draw one line" demo, mission, formats, the live pitch-and-vote board, and newsletter sign-up |
| `/about` | Our story, the design thinking process, our goals, and the team |
| `/qr` | A printable poster with the QR code to tape next to a whiteboard (plus PNG/SVG downloads) |
| `/admin` | Password-protected: hide or delete pitches, set this week's prompt, see QR scans, export CSVs for the newsletter |

The QR code points to `/?from=qr#pitch`. People who scan it land on the pitch board with a welcome message, and the scan is counted on `/admin`.

## Editing content

Most copy lives in **`content/site.ts`**: team members, formats, prompt starters, the "questions" sticky notes, interview findings, and the booth date. Each team member can optionally get a `role`, `major`, `year`, `line` (a one-sentence quote), and `photo` (put the image in `public/team/` and set `photo: "/team/name.jpg"`).

## Adding the time-lapse video

Put the file at **`public/media/commons-timelapse.mp4`** and push. See `public/media/README.md` for compression tips. Until the file exists, the hero shows animated marker lines instead.

## Pitches, votes, and moderation

- Anyone can pitch a prompt for next week (max 120 characters) and up/down-vote others. One vote per pitch per browser.
- Pitch weeks run Monday to Sunday, Eastern time. The top pitch on Sunday night is the one to put up Monday. Use "Make it the prompt" on `/admin` to update the site banner.
- **Filter:** pitches and names are checked for slurs and profanity, including l33t-speak and spaced-out spellings (`f u c k`), plus links, emails, and phone numbers. Rejected pitches never reach the wall.
- **Reports:** three reports hide a pitch until someone on the team reviews it in `/admin`.
- **Rate limits:** 5 pitches per browser per day, plus per-IP limits on pitches, votes, and sign-ups.

## Running it locally

```bash
npm install
cp .env.example .env.local   # set ADMIN_PASSWORD to anything
npm run dev                  # http://localhost:3000
npm test                     # filter + week math tests
```

Without Redis credentials, data lives in memory and resets when the server restarts. That's fine for local work.

## Deploying (Vercel)

The repo is connected to Vercel, so every push to the production branch deploys automatically. One-time setup in the Vercel dashboard:

1. **Storage → Connect Database → Upstash (Redis)** and connect it to this project. That adds `KV_REST_API_URL` and `KV_REST_API_TOKEN`. Without it, pitches reset on every deploy.
2. **Settings → Environment Variables:** add `ADMIN_PASSWORD`.
3. Redeploy.

Optional: `NEXT_PUBLIC_SITE_URL` (if you add a custom domain, so the QR code uses it) and `NEXT_PUBLIC_HERO_VIDEO` (to host the video elsewhere).

## Tech

Next.js 15 (App Router) + TypeScript, plain CSS, Upstash Redis, [`obscenity`](https://github.com/jo3-l/obscenity) for the filter, and `qrcode` for the poster.
