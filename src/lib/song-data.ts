import { readFile } from "node:fs/promises";
import path from "node:path";

export type SongRecord = {
  id: string;
  title: string;
  artist: string;
  playedAt: string | null;
  dateText: string | null;
  timeText: string | null;
  seenCount: number | null;
  songLink?: string | null;
  raw: Record<string, string>;
};

export type SongDataResult = {
  songs: SongRecord[];
  sourceLabel: string;
  usingSampleData: boolean;
  fetchedAt: string;
};

const SAMPLE_SONGS: SongRecord[] = [
  {
    id: "sample-1",
    title: "I Can Only Imagine",
    artist: "MercyMe",
    playedAt: "2026-06-19T19:58:00-05:00",
    dateText: "2026-06-19",
    timeText: "7:58 PM",
    seenCount: 14,
    raw: {},
  },
  {
    id: "sample-2",
    title: "Goodness of God",
    artist: "CeCe Winans",
    playedAt: "2026-06-19T19:53:00-05:00",
    dateText: "2026-06-19",
    timeText: "7:53 PM",
    seenCount: 22,
    raw: {},
  },
  {
    id: "sample-3",
    title: "There Was Jesus",
    artist: "Zach Williams & Dolly Parton",
    playedAt: "2026-06-19T19:49:00-05:00",
    dateText: "2026-06-19",
    timeText: "7:49 PM",
    seenCount: 10,
    raw: {},
  },
  {
    id: "sample-4",
    title: "Who I Am",
    artist: "Ben Fuller",
    playedAt: "2026-06-19T19:45:00-05:00",
    dateText: "2026-06-19",
    timeText: "7:45 PM",
    seenCount: 18,
    raw: {},
  },
  {
    id: "sample-5",
    title: "Fear Is Not My Future",
    artist: "Maverick City Music",
    playedAt: "2026-06-19T19:41:00-05:00",
    dateText: "2026-06-19",
    timeText: "7:41 PM",
    seenCount: 8,
    raw: {},
  },
];

const TITLE_KEYS = ["title", "song", "song title", "track", "name"];
const ARTIST_KEYS = ["artist", "artists", "singer", "band"];
const PLAYED_AT_KEYS = ["played_at", "played at", "timestamp", "datetime", "date time", "last seen"];
const DATE_KEYS = ["date", "played_date", "day"];
const TIME_KEYS = ["time", "played_time"];
const COUNT_KEYS = ["seen count", "count", "plays", "play count"];
const LINK_KEYS = ["song link", "link", "youtube music link", "yt music link"];

export function normalizeKey(value: string) {
  return value.trim().toLowerCase().replace(/[_-]+/g, " ");
}

function normalizeRow(row: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [normalizeKey(key), value.trim()]),
  );
}

function firstValue(row: Record<string, string>, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (value) return value;
  }
  return "";
}

export function splitCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells.map((cell) => cell.replace(/\r/g, "").trim());
}

export function parseCsv(text: string) {
  const lines = text
    .split(/\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    return [] as Record<string, string>[];
  }

  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

export function parsePlayedAt(value: string | null | undefined) {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
}

function buildPlayedAt(dateText: string, timeText: string) {
  if (!dateText && !timeText) return null;
  const combined = `${dateText} ${timeText}`.trim();
  const parsed = parsePlayedAt(combined);
  return parsed ?? null;
}

export function mapRowToSong(row: Record<string, string>, index: number): SongRecord | null {
  const normalized = normalizeRow(row);
  const title = firstValue(normalized, TITLE_KEYS);
  const artist = firstValue(normalized, ARTIST_KEYS);
  const playedAtText = firstValue(normalized, PLAYED_AT_KEYS);
  const dateText = firstValue(normalized, DATE_KEYS) || null;
  const timeText = firstValue(normalized, TIME_KEYS) || null;
  const seenCountRaw = firstValue(normalized, COUNT_KEYS);
  const songLink = firstValue(normalized, LINK_KEYS) || null;

  if (!title && !artist) {
    return null;
  }

  const playedAt = parsePlayedAt(playedAtText) ?? buildPlayedAt(dateText ?? "", timeText ?? "");
  const seenCount = seenCountRaw ? Number(seenCountRaw.replace(/,/g, "")) || null : null;

  return {
    id: `${title || "song"}-${artist || "artist"}-${playedAt || index}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
    title: title || "Unknown title",
    artist: artist || "Unknown artist",
    playedAt,
    dateText,
    timeText,
    seenCount,
    songLink,
    raw: row,
  };
}

function sortSongs(songs: SongRecord[]) {
  return songs.sort((a, b) => {
    if (!a.playedAt && !b.playedAt) return (b.seenCount ?? 0) - (a.seenCount ?? 0);
    if (!a.playedAt) return 1;
    if (!b.playedAt) return -1;
    return a.playedAt < b.playedAt ? 1 : -1;
  });
}

function getSheetUrl() {
  const direct = process.env.KSBJ_SONGS_CSV_URL?.trim();
  if (direct) {
    return { url: direct, sourceLabel: "Published Google Sheet CSV" };
  }

  const sheetId = process.env.KSBJ_SONGS_SHEET_ID?.trim();
  if (!sheetId) {
    return null;
  }

  const gid = process.env.KSBJ_SONGS_GID?.trim() || "0";
  return {
    url: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`,
    sourceLabel: "Google Sheet export",
  };
}

export function buildSongData(rows: Record<string, string>[], sourceLabel: string): SongDataResult {
  const songs = sortSongs(
    rows
      .map((row, index) => mapRowToSong(row, index))
      .filter((song): song is SongRecord => Boolean(song)),
  );

  return {
    songs,
    sourceLabel,
    usingSampleData: false,
    fetchedAt: new Date().toISOString(),
  };
}

async function readCachedSongData(): Promise<SongDataResult | null> {
  const cachePaths = [
    path.join(/*turbopackIgnore: true*/ process.cwd(), "..", "sources", "ksbj", "data", "app-songs.json"),
    path.join(process.cwd(), "data", "songs.json"),
  ];

  for (const cachePath of cachePaths) {
    try {
      const content = await readFile(cachePath, "utf8");
      const parsed = JSON.parse(content) as SongDataResult;
      if (Array.isArray(parsed.songs)) {
        return parsed;
      }
    } catch {
      // try the next cache path
    }
  }

  return null;
}

async function fetchSongDataFromSheet(): Promise<SongDataResult | null> {
  const configuredSheet = getSheetUrl();
  if (!configuredSheet) {
    return null;
  }

  const response = await fetch(configuredSheet.url, {
    next: { revalidate: 300 },
    headers: {
      "User-Agent": "ksbj-song-list/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Sheet request failed: ${response.status}`);
  }

  const csvText = await response.text();
  if (/<!doctype html|<html/i.test(csvText)) {
    throw new Error("Sheet export returned HTML instead of CSV");
  }

  return buildSongData(parseCsv(csvText), configuredSheet.sourceLabel);
}

export async function getSongData(): Promise<SongDataResult> {
  const cached = await readCachedSongData();
  if (cached) {
    return cached;
  }

  try {
    const live = await fetchSongDataFromSheet();
    if (live) {
      return live;
    }
  } catch {
    // fall through to sample data
  }

  return {
    songs: SAMPLE_SONGS,
    sourceLabel: "Sample data",
    usingSampleData: true,
    fetchedAt: new Date().toISOString(),
  };
}

