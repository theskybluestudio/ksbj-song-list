# SEO Roadmap for `application/`

Concrete next-step plan for growing search traffic beyond the current page-level metadata foundation.

## Current baseline already implemented

- global metadata in `src/app/layout.tsx`
- per-page metadata for `/`, `/ksbj`, `/klove`
- Open Graph + Twitter metadata
- generated OG image at `/opengraph-image`
- JSON-LD for home/KSBJ/K-LOVE collection pages
- `robots.ts`
- `sitemap.ts`
- canonical site URL from `NEXT_PUBLIC_SITE_URL`

## Goal of the next gain

Move from a small number of well-tagged pages to a larger set of useful, internally linked, indexable pages that match long-tail search intent.

The best next gain is not more meta tags. It is **more useful crawlable pages with structured relationships**.

---

## Recommended build order

1. Artist pages
2. Artist index page
3. Song pages
4. Song index page
5. Richer schema + sitemap expansion + freshness improvements

This order keeps implementation risk low while creating real SEO surface area quickly.

---

## Phase 1 — Artist pages

### Routes

- `src/app/artists/page.tsx`
- `src/app/artists/[slug]/page.tsx`

### Why artist pages first

- fewer pages than song-level pages
- high search intent
- easy to make useful with existing data
- easier to avoid thin-content problems

### Data model additions

Create a shared aggregation utility, e.g.:

- `src/lib/catalog.ts`
- `src/lib/slug.ts`

Suggested types:

```ts
export type SourceKey = "ksbj" | "klove";

export type CatalogSongRecord = SongRecord & {
  source: SourceKey;
};

export type ArtistSummary = {
  slug: string;
  name: string;
  songCount: number;
  totalSeenCount: number;
  latestPlayedAt: string | null;
  sources: SourceKey[];
  songs: CatalogSongRecord[];
};
```

### Needed utility behavior

- load KSBJ + K-LOVE datasets together
- normalize artist names for grouping
- generate stable slugs
- aggregate:
  - song count
  - total seen count
  - latest played date
  - source coverage

### Artist page content

Each artist page should include:

- artist title and description
- which sources the artist appears in
- song list for that artist
- total play count / seen count
- latest observed play date
- outbound links to song links where available

### SEO on artist page

Add per-page metadata:

- title: `Songs by {Artist} | Sky Blue Studio Music Tracker`
- description based on artist presence and sources
- canonical: `/artists/[slug]`

Add JSON-LD:

- `MusicGroup` or `Person` depending on heuristics if desired later
- for now, a safe first version can use:
  - `CollectionPage`
  - `ItemList`
  - `about: { name: artistName }`

### Internal linking

Add artist links from:

- recent songs cards where practical
- most-played lists where practical
- song table artist column

This is important. It creates crawl paths, not just standalone pages.

### Acceptance criteria

- `/artists` exists
- `/artists/[slug]` exists
- every artist page has unique title/description/canonical
- artist pages render useful content, not just a name
- artist links appear from current dashboards

---

## Phase 2 — Song pages

### Routes

- `src/app/songs/page.tsx`
- `src/app/songs/[slug]/page.tsx`

### Slug strategy

Use title + artist in the slug, not title alone.

Example:
- `/songs/goodness-of-god-cece-winans`

This avoids collisions and makes URLs clearer.

### Suggested song aggregate type

```ts
export type SongSummary = {
  slug: string;
  title: string;
  artist: string;
  totalSeenCount: number;
  latestPlayedAt: string | null;
  sources: SourceKey[];
  variants: CatalogSongRecord[];
  thumbnailUrl: string | null;
  primarySongLink: string | null;
};
```

### Song page content

Each song page should include:

- song title
- artist
- thumbnail if available
- source coverage (KSBJ, K-LOVE)
- total observed plays / seen count
- latest seen date
- links to source dashboards
- direct YouTube Music link if available

### SEO on song page

Per-page metadata:

- title: `{Song} — {Artist} | Sky Blue Studio Music Tracker`
- description with source coverage and recency
- canonical: `/songs/[slug]`

JSON-LD:

- `MusicRecording`
- linked performer name
- `isPartOf` website / collection page

### Internal linking

Add links from:

- song title in dashboard tables
- artist page song lists
- source pages where safe for UX

### Acceptance criteria

- `/songs` exists
- `/songs/[slug]` exists
- unique metadata per song page
- internal linking between artist/song/source pages works

---

## Phase 3 — Index pages that are actually useful

### `/artists`

Show:

- searchable artist list
- song counts
- total seen counts
- source badges
- latest played date

### `/songs`

Show:

- searchable song list
- artist
- total seen counts
- latest played date
- source badges

### Why this matters

These pages help both:

- users browse the catalog
- crawlers discover the long-tail pages

---

## Phase 4 — Richer schema and freshness

### Schema upgrades

Add where useful:

- `BreadcrumbList`
- `MusicRecording`
- `ItemList`
- `CollectionPage`
- `WebSite`

Potential breadcrumb chains:

- Home → Artists → Artist
- Home → Songs → Song
- Home → KSBJ / K-LOVE

### Freshness improvements

Current `sitemap.ts` uses `new Date()`.

Upgrade it later to real data-driven timestamps:

- last modified from KSBJ fetchedAt
- last modified from K-LOVE fetchedAt
- last modified for artist/song pages from latest observed song date

### Sitemap expansion

Eventually include:

- `/artists`
- `/songs`
- top artist pages
- top song pages
- individual artist pages
- individual song pages

This should happen only after those pages exist and are useful.

---

## Suggested implementation modules

### New files likely needed

- `src/lib/catalog.ts`
- `src/lib/slug.ts`
- `src/app/artists/page.tsx`
- `src/app/artists/[slug]/page.tsx`
- `src/app/songs/page.tsx`
- `src/app/songs/[slug]/page.tsx`
- optional UI components:
  - `src/components/artist-list.tsx`
  - `src/components/song-list.tsx`
  - `src/components/breadcrumbs.tsx`

### Responsibilities

#### `catalog.ts`
- load both source datasets
- combine songs with source labels
- build artist summaries
- build song summaries
- expose lookup-by-slug helpers

#### `slug.ts`
- shared stable slug builder
- artist slug builder
- song slug builder

---

## UX guardrails

Avoid thin or spammy pages.

That means:

- do not create pages with almost no content
- avoid duplicate pages for trivial naming variations until normalization is good enough
- prefer fewer useful pages over many weak pages

If an artist or song has too little information, it should still show:

- source presence
n- last seen
- related songs/artist links
- outbound listening link when available

---

## Delivery order I recommend

### Sprint 1

- add `slug.ts`
- add `catalog.ts`
- add `/artists`
- add `/artists/[slug]`
- add metadata + JSON-LD
- add internal artist links from dashboards

### Sprint 2

- add `/songs`
- add `/songs/[slug]`
- add metadata + JSON-LD
- add song links from dashboards and artist pages

### Sprint 3

- expand sitemap
- add breadcrumbs
- use real timestamps for `lastModified`
- refine schema types

---

## Success metrics to watch

After launch, watch for:

- indexed page count rising
- impressions on artist/song long-tail queries
- clicks to artist/song pages
- crawl discovery of new routes
- whether pages with internal links get indexed faster than isolated ones

---

## Recommended next implementation task

Start with **Sprint 1: artist pages**.

That is the best balance of:

- SEO impact
- implementation cost
- usefulness to humans
- lower risk of thin pages
