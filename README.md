# Radio Song Tracker App

A shared Next.js app for browsing songs played on KSBJ and K-LOVE.

## Stack

- Next.js (App Router)
- React
- Tailwind CSS
- Google Sheet CSV export as the data source

## Why this approach

This keeps the MVP simple:
- no separate backend required yet
- easy to host on Vercel or any Node-friendly platform
- the sheet stays the source of truth
- you can later add caching, charts, auth, or a database without rewriting the app

## Local development

```bash
cd application
cp .env.example .env.local
npm run sync
npm run dev
```

Open http://localhost:3000

For production SEO metadata, set:

```bash
NEXT_PUBLIC_SITE_URL=https://music.skybluestudio.net
```

## Google Sheet setup

### Option 1: easiest

Publish a station sheet as CSV, then set:

```bash
KSBJ_SONGS_CSV_URL=https://docs.google.com/spreadsheets/d/.../export?format=csv&gid=0
KLOVE_SONGS_CSV_URL=https://docs.google.com/spreadsheets/d/.../export?format=csv&gid=0
```

### Option 2

Set these shared sheet variables and the app will read from the configured KSBJ tab:

```bash
KSBJ_SHEET_ID=your_sheet_id
KSBJ_SHEET_TAB=KSBJ Master
KSBJ_PLAY_LOG_SHEET_TAB=KSBJ Play Log
KLOVE_SHEET_ID=your_sheet_id
KLOVE_SHEET_TAB=KLOVE Master
KLOVE_PLAY_LOG_SHEET_TAB=KLOVE Play Log
```

Also set:

```bash
NEXT_PUBLIC_SITE_URL=https://music.skybluestudio.net
```

## Expected columns

The loader is flexible. It looks for common column names such as:

- title / song / song title / track / name
- artist / artists / singer / band
- played_at / played at / timestamp / datetime
- date
- time

If your sheet uses separate `date` and `time` columns, that works too.

## Current features

- most recently played song list
- search by title or artist
- sort and recency filters
- basic stats
- JSON cache support via `sources/ksbj/data/app-songs.json`, `sources/klove/data/app-songs.json`, `application/data/ksbj-songs.json`, and `application/data/klove-songs.json`
- sample fallback data when a source cache is not available yet

## JSON sync flow

The app prefers the source-owned cache files under `sources/<station>/data/` and falls back to `application/data/*.json`.

Generate or refresh it with:

```bash
npm run sync
```

That script:
- fetches the KSBJ sheet data from either `KSBJ_SONGS_CSV_URL` or `KSBJ_SHEET_ID` + `KSBJ_SHEET_TAB`
- normalizes rows into song objects
- always writes `application/data/ksbj-songs.json`
- writes `sources/ksbj/data/app-songs.json` when source-cache writes are enabled
- fetches the K-LOVE sheet data from either `KLOVE_SONGS_CSV_URL` or `KLOVE_SHEET_ID` + `KLOVE_SHEET_TAB`
- always writes `application/data/klove-songs.json`
- writes `sources/klove/data/app-songs.json` when source-cache writes are enabled

You can also run each side separately:

```bash
npm run sync:ksbj
npm run sync:klove
```

For standalone deployments that only contain the `application/` folder, set:

```bash
SYNC_SOURCE_CACHE=false
```

That keeps sync successful even when `../sources/...` is unavailable, while still refreshing the app-local caches under `application/data/`.

This makes page loads less dependent on Google Sheets latency.

## Next good additions

- filter by day or hour
- recently most-played songs
- artist detail pages
- station branding and links back to KSBJ
- background sync into SQLite or Postgres for analytics
