# KSBJ Song History App

A Next.js app for browsing songs played on KSBJ, backed by a Google Sheet.

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

Publish the sheet as CSV, then set:

```bash
KSBJ_SONGS_CSV_URL=https://docs.google.com/spreadsheets/d/.../export?format=csv&gid=0
```

### Option 2

Set these environment variables and the app will build the CSV export URL:

```bash
KSBJ_SONGS_SHEET_ID=your_sheet_id
KSBJ_SONGS_GID=0
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

## Current MVP features

- most recently played song list
- search by title or artist
- sort and recency filters
- basic stats
- JSON cache support via `application/data/songs.json`
- sample fallback data when the sheet is not configured yet

## JSON sync flow

The app prefers `application/data/songs.json` when it exists.

Generate or refresh it with:

```bash
npm run sync
```

That script:
- fetches the Google Sheet CSV
- normalizes rows into song objects
- writes `data/songs.json`

This makes page loads less dependent on Google Sheets latency.

## Next good additions

- filter by day or hour
- recently most-played songs
- artist detail pages
- station branding and links back to KSBJ
- background sync into SQLite or Postgres for analytics
