import { mkdir, readFile, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, "..");
const projectRoot = path.resolve(appRoot, "..");

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

function splitCsvLine(line) {
  const cells = [];
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

function parseCsv(text) {
  const lines = text
    .split(/\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    return [];
  }

  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
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
  const sheetId = process.env.KLOVE_SHEET_ID?.trim();
  if (!sheetId) {
    throw new Error("Missing KLOVE_SHEET_ID or KLOVE_SONGS_CSV_URL in .env.local");
  }
  return sheetId;
}

function getCsvUrl() {
  return process.env.KLOVE_SONGS_CSV_URL?.trim() || null;
}

async function gogJson(args) {
  const { stdout } = await execFileAsync("gog", [...args, "--json", "--no-input"], {
    cwd: appRoot,
    maxBuffer: 10 * 1024 * 1024,
  });
  return JSON.parse(stdout);
}

function shouldWriteSourceCache() {
  const raw = process.env.SYNC_SOURCE_CACHE?.trim().toLowerCase();
  if (!raw) return true;
  return !["0", "false", "no", "off"].includes(raw);
}

async function writeRequiredCache(outPath, content) {
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, content, "utf8");
}

async function writeOptionalCache(outPath, content) {
  try {
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, content, "utf8");
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`WARN: Skipped optional source cache write for ${outPath}: ${message}`);
    return false;
  }
}

function rowsFromValues(values) {
  if (!Array.isArray(values) || values.length < 2) return [];
  const headers = values[0].map((value) => String(value ?? ""));
  return values.slice(1).map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, String(row[index] ?? "")])),
  );
}

function sortSongs(records) {
  return records.sort((a, b) => {
    if (!a.playedAt && !b.playedAt) return (b.seenCount ?? 0) - (a.seenCount ?? 0);
    if (!a.playedAt) return 1;
    if (!b.playedAt) return -1;
    return a.playedAt < b.playedAt ? 1 : -1;
  });
}

async function fetchRowsFromCsvUrl(csvUrl) {
  const response = await fetch(csvUrl, {
    headers: {
      "User-Agent": "radio-song-list/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`CSV request failed: ${response.status}`);
  }

  const csvText = await response.text();
  if (/<!doctype html|<html/i.test(csvText)) {
    throw new Error("CSV export returned HTML instead of CSV");
  }

  return parseCsv(csvText);
}

async function main() {
  await loadLocalEnv();
  const csvUrl = getCsvUrl();
  let rows;
  let sourceLabel;

  if (csvUrl) {
    rows = await fetchRowsFromCsvUrl(csvUrl);
    sourceLabel = "Published Google Sheet CSV";
  } else {
    const sheetId = getSheetId();
    const sheetTab = process.env.KLOVE_SHEET_TAB?.trim() || "KLOVE Master";
    const valuesResponse = await gogJson(["sheets", "get", sheetId, `${sheetTab}!A:Z`]);
    rows = rowsFromValues(valuesResponse.values);
    sourceLabel = `Google Sheets cache (${sheetTab})`;
  }

  const songs = sortSongs(rows.map((row, index) => mapRowToSong(row, index)).filter(Boolean));

  const payload = {
    songs,
    sourceLabel,
    usingSampleData: false,
    fetchedAt: new Date().toISOString(),
  };

  const content = `${JSON.stringify(payload, null, 2)}\n`;
  const appCachePath = path.join(appRoot, "data", "klove-songs.json");
  const sourceCachePath = path.join(projectRoot, "sources", "klove", "data", "app-songs.json");

  await writeRequiredCache(appCachePath, content);

  const wrotePaths = [appCachePath];
  if (shouldWriteSourceCache()) {
    const wroteSource = await writeOptionalCache(sourceCachePath, content);
    if (wroteSource) {
      wrotePaths.unshift(sourceCachePath);
    }
  }

  console.log(`Wrote ${songs.length} songs to ${wrotePaths.join(", ")}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
