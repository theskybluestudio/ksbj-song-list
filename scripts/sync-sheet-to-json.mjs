import { mkdir, readFile, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, "..");

function parseEnvFile(content) {
  const env = {};

  for (const rawLine of content.split(/\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

async function loadLocalEnv() {
  for (const name of [".env.local", ".env"]) {
    const filePath = path.join(appRoot, name);
    try {
      const content = await readFile(filePath, "utf8");
      Object.assign(process.env, parseEnvFile(content));
    } catch {
      // ignore missing file
    }
  }
}

function normalizeKey(value) {
  return value.trim().toLowerCase().replace(/[_-]+/g, " ");
}

const TITLE_KEYS = ["title", "song", "song title", "track", "name"];
const ARTIST_KEYS = ["artist", "artists", "singer", "band"];
const PLAYED_AT_KEYS = ["played_at", "played at", "timestamp", "datetime", "date time", "last seen"];
const DATE_KEYS = ["date", "played_date", "day"];
const TIME_KEYS = ["time", "played_time"];
const COUNT_KEYS = ["seen count", "count", "plays", "play count"];
const LINK_KEYS = ["song link", "link", "youtube music link", "yt music link"];

function firstValue(row, keys) {
  for (const key of keys) {
    const value = row[key];
    if (value) return value;
  }
  return "";
}

function parsePlayedAt(value) {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
}

function buildPlayedAt(dateText, timeText) {
  if (!dateText && !timeText) return null;
  return parsePlayedAt(`${dateText} ${timeText}`.trim());
}

function mapRowToSong(row, index) {
  const normalized = Object.fromEntries(
    Object.entries(row).map(([key, value]) => [normalizeKey(key), String(value).trim()]),
  );

  const title = firstValue(normalized, TITLE_KEYS);
  const artist = firstValue(normalized, ARTIST_KEYS);
  const playedAtText = firstValue(normalized, PLAYED_AT_KEYS);
  const dateText = firstValue(normalized, DATE_KEYS) || null;
  const timeText = firstValue(normalized, TIME_KEYS) || null;
  const seenCountRaw = firstValue(normalized, COUNT_KEYS);
  const songLink = firstValue(normalized, LINK_KEYS) || null;

  if (!title && !artist) return null;

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

function getSheetId() {
  const sheetId = process.env.KSBJ_SONGS_SHEET_ID?.trim();
  if (!sheetId) {
    throw new Error("Missing KSBJ_SONGS_SHEET_ID in .env.local");
  }
  return sheetId;
}

async function gogJson(args) {
  const { stdout } = await execFileAsync("gog", [...args, "--json", "--no-input"], {
    cwd: appRoot,
    maxBuffer: 10 * 1024 * 1024,
  });
  return JSON.parse(stdout);
}

function rowsFromValues(values) {
  if (!Array.isArray(values) || values.length < 2) return [];
  const headers = values[0].map((value) => String(value ?? ""));
  return values.slice(1).map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, String(row[index] ?? "")])),
  );
}

async function main() {
  await loadLocalEnv();
  const sheetId = getSheetId();
  const metadata = await gogJson(["sheets", "metadata", sheetId]);
  const firstSheetTitle = metadata?.sheets?.[0]?.properties?.title;

  if (!firstSheetTitle) {
    throw new Error("Could not determine the first sheet tab title");
  }

  const valuesResponse = await gogJson(["sheets", "get", sheetId, `${firstSheetTitle}!A:Z`]);
  const rows = rowsFromValues(valuesResponse.values);
  const songs = rows
    .map((row, index) => mapRowToSong(row, index))
    .filter(Boolean)
    .sort((a, b) => {
      if (!a.playedAt && !b.playedAt) return (b.seenCount ?? 0) - (a.seenCount ?? 0);
      if (!a.playedAt) return 1;
      if (!b.playedAt) return -1;
      return a.playedAt < b.playedAt ? 1 : -1;
    });

  const payload = {
    songs,
    sourceLabel: `Google Sheets cache (${firstSheetTitle})`,
    usingSampleData: false,
    fetchedAt: new Date().toISOString(),
  };

  const dataDir = path.join(appRoot, "data");
  const outPath = path.join(dataDir, "songs.json");
  await mkdir(dataDir, { recursive: true });
  await writeFile(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(`Wrote ${songs.length} songs to ${outPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
