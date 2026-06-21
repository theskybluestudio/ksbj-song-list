import { readFile } from "node:fs/promises";
import path from "node:path";
import type { SongDataResult } from "@/lib/song-data";

const SAMPLE_SONGS: SongDataResult["songs"] = [
  {
    id: "klove-sample-1",
    title: "Nobody feat. Matthew West",
    artist: "Casting Crowns",
    playedAt: "2026-06-21T05:21:10Z",
    dateText: "2026-06-21",
    timeText: "12:21 AM",
    seenCount: 1,
    songLink: "https://www.klove.com/music/artists/casting-crowns/nobody-feat-matthew-west",
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
    songLink: "https://www.klove.com/music/artists/we-the-kingdom/rescue-me",
    raw: {},
  },
];

export async function getKloveSongData(): Promise<SongDataResult> {
  const cachePath = path.join(process.cwd(), "data", "klove-songs.json");

  try {
    const content = await readFile(cachePath, "utf8");
    const parsed = JSON.parse(content) as SongDataResult;
    if (Array.isArray(parsed.songs)) {
      return parsed;
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
