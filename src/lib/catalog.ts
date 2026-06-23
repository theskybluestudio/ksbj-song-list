import { getKloveSongData } from "@/lib/klove-song-data";
import { type SongRecord, getSongData } from "@/lib/song-data";
import { buildArtistSlug, buildSongSlug } from "@/lib/slug";

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
  thumbnailUrl: string | null;
};

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

function normalizeArtistName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeSongKey(title: string, artist: string) {
  return `${title.trim().toLowerCase().replace(/\s+/g, " ")}::${normalizeArtistName(artist)}`;
}

function compareSongsByRecency(a: SongRecord, b: SongRecord) {
  const aPlayedAt = a.playedAt ?? "";
  const bPlayedAt = b.playedAt ?? "";
  if (aPlayedAt !== bPlayedAt) {
    return aPlayedAt < bPlayedAt ? 1 : -1;
  }
  return a.title.localeCompare(b.title) || a.artist.localeCompare(b.artist);
}

export async function getAllSourceSongs(): Promise<CatalogSongRecord[]> {
  const [ksbj, klove] = await Promise.all([getSongData(), getKloveSongData()]);

  return [
    ...ksbj.songs.map((song) => ({ ...song, source: "ksbj" as const })),
    ...klove.songs.map((song) => ({ ...song, source: "klove" as const })),
  ];
}

export async function getArtistSummaries(): Promise<ArtistSummary[]> {
  const songs = await getAllSourceSongs();
  const byArtist = new Map<string, CatalogSongRecord[]>();

  for (const song of songs) {
    const key = normalizeArtistName(song.artist);
    const current = byArtist.get(key) ?? [];
    current.push(song);
    byArtist.set(key, current);
  }

  return [...byArtist.entries()]
    .map(([, artistSongs]) => {
      const songsSorted = [...artistSongs].sort(compareSongsByRecency);
      const name = songsSorted[0]?.artist ?? "Unknown artist";
      const sources = [...new Set(songsSorted.map((song) => song.source))].sort() as SourceKey[];
      const latestPlayedAt = songsSorted.find((song) => song.playedAt)?.playedAt ?? null;
      const totalSeenCount = songsSorted.reduce((sum, song) => sum + (song.seenCount ?? 0), 0);
      const uniqueSongKeys = new Set(songsSorted.map((song) => `${song.title}::${song.source}`));
      const thumbnailUrl = songsSorted.find((song) => song.thumbnailUrl)?.thumbnailUrl ?? null;

      return {
        slug: buildArtistSlug(name),
        name,
        songCount: uniqueSongKeys.size,
        totalSeenCount,
        latestPlayedAt,
        sources,
        songs: songsSorted,
        thumbnailUrl,
      } satisfies ArtistSummary;
    })
    .sort((a, b) => {
      const seenComparison = b.totalSeenCount - a.totalSeenCount;
      if (seenComparison !== 0) return seenComparison;
      const latestA = a.latestPlayedAt ?? "";
      const latestB = b.latestPlayedAt ?? "";
      if (latestA !== latestB) return latestA < latestB ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
}

export async function getArtistSummaryBySlug(slug: string) {
  const artists = await getArtistSummaries();
  return artists.find((artist) => artist.slug === slug) ?? null;
}

export async function getSongSummaries(): Promise<SongSummary[]> {
  const songs = await getAllSourceSongs();
  const bySong = new Map<string, CatalogSongRecord[]>();

  for (const song of songs) {
    const key = normalizeSongKey(song.title, song.artist);
    const current = bySong.get(key) ?? [];
    current.push(song);
    bySong.set(key, current);
  }

  return [...bySong.entries()]
    .map(([, songVariants]) => {
      const variants = [...songVariants].sort(compareSongsByRecency);
      const primary = variants[0];
      const sources = [...new Set(variants.map((song) => song.source))].sort() as SourceKey[];
      const latestPlayedAt = variants.find((song) => song.playedAt)?.playedAt ?? null;
      const totalSeenCount = variants.reduce((sum, song) => sum + (song.seenCount ?? 0), 0);
      const thumbnailUrl = variants.find((song) => song.thumbnailUrl)?.thumbnailUrl ?? null;
      const primarySongLink = variants.find((song) => song.songLink)?.songLink ?? null;

      return {
        slug: buildSongSlug(primary?.title ?? "Unknown title", primary?.artist ?? "Unknown artist"),
        title: primary?.title ?? "Unknown title",
        artist: primary?.artist ?? "Unknown artist",
        totalSeenCount,
        latestPlayedAt,
        sources,
        variants,
        thumbnailUrl,
        primarySongLink,
      } satisfies SongSummary;
    })
    .sort((a, b) => {
      const seenComparison = b.totalSeenCount - a.totalSeenCount;
      if (seenComparison !== 0) return seenComparison;
      const latestA = a.latestPlayedAt ?? "";
      const latestB = b.latestPlayedAt ?? "";
      if (latestA !== latestB) return latestA < latestB ? 1 : -1;
      return a.title.localeCompare(b.title) || a.artist.localeCompare(b.artist);
    });
}

export async function getSongSummaryBySlug(slug: string) {
  const songs = await getSongSummaries();
  return songs.find((song) => song.slug === slug) ?? null;
}
