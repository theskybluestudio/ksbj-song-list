import { readFile } from "node:fs/promises";
import path from "node:path";
import { buildSongData, parseCsv, type SongDataResult } from "@/lib/song-data";

const SAMPLE_SONGS: SongDataResult["songs"] = [
  {
    id: "klove-sample-1",
    title: "Nobody feat. Matthew West",
    artist: "Casting Crowns",
    playedAt: "2026-06-21T05:21:10Z",
    dateText: "2026-06-21",
    timeText: "12:21 AM",
    seenCount: 1,
    raw: {},
  },
  {
    id: "klove-sample-2",
    title: "Rescue Me",
    artist: "We The Kingdom",
    playedAt: "2026-06-21T05:17:44Z",
    dateText: "2026-06-21",
    timeText: "12:17 AM",
    seenCount: 1,
    raw: {},
  },
];

function getSheetUrl() {
  const direct = process.env.KLOVE_SONGS_CSV_URL?.trim();
  if (direct) {
    return { url: direct, sourceLabel: "Published Google Sheet CSV" };
  }

  const sheetId = process.env.KLOVE_SHEET_ID?.trim();
  if (!sheetId) {
    return null;
  }

  const sheetTab = process.env.KLOVE_SHEET_TAB?.trim() || "KLOVE Master";
  const encodedTab = encodeURIComponent(sheetTab);
  return {
    url: `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodedTab}`,
    sourceLabel: `Google Sheet export (${sheetTab})`,
  };
}

export async function getKloveSongData(): Promise<SongDataResult> {
  const useSourceCache = !["0", "false", "no", "off"].includes(
    process.env.SYNC_SOURCE_CACHE?.trim().toLowerCase() ?? "",
  );
  const cachePaths = [
    ...(useSourceCache
      ? [path.join(/*turbopackIgnore: true*/ process.cwd(), "..", "sources", "klove", "data", "app-songs.json")]
      : []),
    path.join(process.cwd(), "data", "klove-songs.json"),
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

  try {
    const configuredSheet = getSheetUrl();
    if (configuredSheet) {
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
