# One-Line Wall: Handoff

Status as of **Oct 19, 2026**: the site is **live on Vercel** with persistent storage (Upstash Redis), and the time-lapse from the Commons booth is in the hero. Paused here until the team picks it back up.

Project: BUS 3340 Design Thinking (Prof. Gavin Fox), W&L. Team: Drake, Julianna, Elliott, Jake, Jackson.

## Where everything lives

| Thing | Where |
| --- | --- |
| Code | `github.com/DrakeKrommenhoek/onelinewall`, branch `claude/laughing-mendel-fw2u42` (the only branch, so it's production) |
| Hosting | Vercel project `onelinewall` (Drake's account). Every push to the branch deploys automatically. |
| Database | Upstash Redis, its own database (not shared with Ascend), connected through Vercel → Storage. Free plan, no card. |
| Admin | `/admin` on the live site. Password = the `ADMIN_PASSWORD` env var in Vercel (Drake set it). |
| QR poster | `/qr` on the live site (print it, or download PNG/SVG). The code points to `/?from=qr#pitch`. |

## What the site does

- **Home (`/`):** time-lapse hero, how it works, the problem (the "too many questions" sticky notes and the place/people/pressure/access findings), a "draw one line" demo, mission, wall formats, the pitch-and-vote board, and a "Weekly Line" newsletter sign-up (W&L emails only).
- **Pitch board:** students pitch next week's prompt and up/down-vote. Weeks run Monday to Sunday, Eastern time. The top pitch Sunday night goes up Monday.
- **Moderation:** a filter blocks slurs, profanity (including disguised spellings), links, emails and phone numbers. Three reports hide a pitch until it's reviewed. Rate limits are on.
- **`/about`:** story, design-thinking timeline, goals, and team cards.
- **`/admin`:** QR scans, pitch/vote/sign-up counts, setting this week's prompt (the top banner), "Make it the prompt" on any pitch, hide/unhide/delete, and CSV exports (one week, everything, and newsletter emails).

## Weekly routine (5 minutes)

1. **Sunday night:** on `/admin`, find the top pitch and click **Make it the prompt**.
2. **Monday:** write the prompt on the boards and photograph last week's finished wall.
3. **For the newsletter:** export the week's CSV and the email list from `/admin`.
4. **Any time:** check `/admin` for reported (hidden) pitches.

## How to change things

- **Copy, team bios, formats, prompt starters, booth date:** `content/site.ts`. Team members can take an optional `role`, `major`, `year`, `line` (a one-sentence quote), and `photo` (put the image in `public/team/`).
- **Hero video:** replace the three files in `public/media/`. The commands are in `public/media/README.md`.
- **Design:** `app/globals.css`, using the marker colors at the top.
- **Run locally:** `npm install`, then `npm run dev` (data stays in memory unless the Redis env vars are set), and `npm test`.

## Open items / ideas for later

- [ ] **Interview quotes:** confirm the three quotes on the home page are OK to use. They're credited only as "W&L student, empathy interview." Your production checklist said to get permission.
- [ ] **Team cards:** add roles, years, photos, or a one-line quote for each person (they currently show first names only).
- [ ] **Better video:** the clip is 960×540 and looks a little soft at full desktop width. Swap in a higher-resolution export if one exists.
- [ ] **Newsletter:** sign-ups are being collected, but nothing sends yet. For now, export the CSV and send it manually; automate it later if the project continues.
- [ ] **Booth photos:** add a gallery of finished walls once there are a few weeks of photos.
- [ ] **Custom domain:** optional, about $10–20 a year. If you add one, set `NEXT_PUBLIC_SITE_URL` in Vercel so the QR code uses it, then reprint the poster.
- [ ] **Shared digital wall:** the "draw one line" demo is local to each visitor. It could become a shared online wall, but it would need moderation.

## Costs

$0 at class-project scale. Upstash's free plan covers 500K commands a month, which is roughly 1,000 visitors a week after the polling fix. Vercel Hobby is free. With no card on file, Upstash can't charge you: at the limit it throttles the database until the month resets. Usage is visible in the Upstash dashboard.

## Gotchas

- **Video files:** the iPhone `.mov` is HEVC, which many browsers can't play, so convert any new video with the ffmpeg commands in `public/media/README.md`.
- **Database connection:** if `/api/ideas` ever shows `"storage":"memory"`, the site has lost its connection to the database. Check Vercel → Storage, then redeploy. The red box on `/admin` lists which Redis variable names the server can see (never values).
- **Prompt banner:** changes show up within about a minute, because the page is cached for 60 seconds.
