# EM Evidence website

Source for [emevidence.org](https://emevidence.org): a static site listing EM Evidence's clinical and educational tools, the archive of Evidence Rundown newsletters, and the newsletter sign-up form.

It is hosted on Netlify (project `wmem`) and deploys from the `main` branch of this repository. There is no framework or bundler; the pages are plain HTML, CSS and JavaScript.

## What's where

| File | What it does |
| --- | --- |
| `index.html` | The home page: latest newsletter, tools, archive and sign-up |
| `privacy.html`, `404.html` | Privacy notice and the "page not found" page |
| `tools.js` | The list of tools shown as cards (name, description, category, tags, URL, screenshot) |
| `updates.js` | The newsletter archive (the `updates` array) and the code that draws the archive sidebar |
| `app.js` | Search, filters, tool cards, the tool viewer and the "Latest newsletter" card |
| `audio.js` | The "Play audio summary" buttons: opens Spotify's player for an issue's `spotifyEpisodeId`, else Google Drive's player for its `audioId` |
| `subscribe.js` | Sign-up form; posts straight to Loops from the browser |
| `theme-init.js` | Applies dark mode before the page paints (saved choice, else the device setting) |
| `styles.css` | All styling |
| `sw.js`, `manifest.json` | Service worker and web app manifest |
| `icons/` | Logo, app icons and the link-preview image (`og-image.jpg`) |
| `fonts/`, `vendor/` | Self-hosted Inter font and Fuse.js search library |
| `robots.txt`, `sitemap.xml` | For search engines |
| `screenshots/` | Tool card images; see [screenshots/README.md](screenshots/README.md) for the file list |
| `newsletters/` | The archive page (`/newsletters/`, filters by series and year) and, in future, on-site HTML versions of each issue; see [newsletters/README.md](newsletters/README.md) |
| `netlify.toml` | Build command, security and caching headers, and redirects (including the old wmebem domains) |
| `scripts/validate-updates.js` | Checks the newsletter archive before each deploy |
| `scripts/build-feed.js` | Writes `feed.xml` (RSS) from the archive during each deploy; the file is not committed |
| `scripts/build-podcast.js`, `podcast/` | Writes the podcast feed `podcast.xml` during each deploy; see [Podcast](#podcast) |
| `scripts/review-due.js`, `TOOL_REVIEWS.md` | Lists the tools due their two-yearly review, and how the monthly review routine works |
| `scripts/check-links.js` | Checks every tool and Drive link opens for the public; run weekly by `.github/workflows/check-links.yml` |

## Adding a newsletter issue

The newsletter pipeline adds a new object to the top of the `updates` array in `updates.js`. To add one by hand, copy the newest entry and change it:

```js
{
  date: "9 Oct 2026",
  label: "EM Evidence Rundown — Issue 33",
  links: [
    { title: "EM Evidence Rundown — Issue 33", driveId: "<Google Drive file ID>", audioId: "<optional audio summary ID>" }
  ]
},
```

- Newest entries go at the top.
- The Drive file must be shared as "Anyone with the link can view".
- If an issue is re-uploaded, replace the `driveId` in the existing entry rather than adding a second entry.
- `spotifyEpisodeId` (optional, after `audioId`): the issue's podcast episode, the 22 characters after `/episode/` in its Spotify link. The "Play audio summary" buttons then use Spotify's player, with the Drive audio as the fallback. Issue pages already built keep Drive's player until rebuilt with `python3 -I scripts/build-issue-pages.py --drive-id <driveId>`.
- The "Latest newsletter" card shows the most recently dated link whose title contains "EM Evidence Rundown".

### The archive check

`node scripts/validate-updates.js` checks `updates.js` for missing titles or labels, labels that are only a date, unreadable dates, entries out of order, Drive IDs that are malformed or used twice, and two links for the same issue or month. Netlify runs it as the build command, so if it finds a problem the deploy fails and the live site stays as it was. The Netlify deploy log lists each problem.

## Podcast

Each issue's audio summary is also a podcast episode. `scripts/build-podcast.js` writes the feed, `podcast.xml`, during each deploy (the file is not committed), so it is live at <https://emevidence.org/podcast.xml>. Spotify, Apple Podcasts, Pocket Casts and the other apps read that feed; nothing is uploaded to them.

- An issue becomes an episode when its link in `updates.js` has `audioId`, `audioBytes` (the MP3's size in bytes) and `audioSeconds` (its length). The pipeline's `website_sync.py --audio-file` fills these in. Leave the last two out to keep an audio summary on the website only.
- Show title, description, owner email, category and artwork are in `podcast/show.json`; the artwork is `podcast/cover.jpg` (square, 1400 to 3000 px, JPEG or PNG). The owner email must be one Jake can read: Spotify, Apple, Amazon and YouTube send ownership codes to it.
- The audio is served from Google Drive's direct-download link (`drive.google.com/uc?export=download&id=…`), which answers with `audio/mpeg`, the right length and seeking (checked 10 Oct 2026). Spotify copies each episode's audio to its own servers when it reads the feed; other apps stream from Drive.
- Episodes from the old Spotify for Creators feed are kept in `podcast/imported-episodes.json`, written once by `node scripts/import-podcast-feed.js <old feed URL>`. They keep their original `guid`, so apps don't show them as new. Their audio was copied to the public Drive folder on 11 Oct 2026 (the three .m4a files converted to 128 kbps MP3), so they no longer depend on the old account.
- `spotifyShowId` in `podcast/show.json` is the show's ID on Spotify (the 22 characters after `/show/` in its link). The pipeline's `spotify_episode.py` uses it to find each new episode.
- `spotifyEpisodeId` on a link is the episode's ID on Spotify (the 22 characters after `/episode/`). Spotify only has it after reading the feed, so it is added after the issue is published.
- Never change an episode's `audioId` once it is in the feed: the `guid` is built from it, and a new one makes apps show the episode again as new.

## Adding a tool

Copy an existing object in `tools.js`, change its details, and add a screenshot to `screenshots/` with the file name you gave it. Cards without a screenshot show a blue fallback with the tool's icon.

- `category` must be one of `Bedside Aids`, `Paediatrics`, `UHB Tools`, `Simulation`, `Education & Advisory` or `Journal Club`. `UHB Tools` is for tools specific to University Hospitals Birmingham sites (BHH, GHH, QEHB, Solihull).
- `isNew: true` also shows the tool in the Highlighted Apps row. Each tool should have only one entry.
- `openInNewTab: true` opens the tool in a new tab instead of the in-page viewer. Use it for tools that refuse to be framed, or that are hosted anywhere other than `*.netlify.app` (the site's security policy only allows those in the viewer).

### The link check

`node scripts/check-links.js` requests every tool URL and every Drive file as a member of the public would, and lists any that fail (a Drive file that isn't shared as "Anyone with the link" shows as 401). GitHub runs it every Monday; a failed run means a link needs fixing.

## Deploying

Push to `main`; Netlify builds and publishes automatically. To check the archive locally first, run `node scripts/validate-updates.js` (Node 18 or later).
