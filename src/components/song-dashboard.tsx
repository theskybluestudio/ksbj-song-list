"use client";

import { useEffect, useMemo, useState } from "react";
import type { SongRecord } from "@/lib/song-data";

type SongDashboardProps = {
  songs: SongRecord[];
  sourceLabel: string;
  usingSampleData: boolean;
  fetchedAt: string;
};

type RecencyOption = "all" | "24h" | "7d" | "30d";
type ThemeMode = "light" | "dark";
type SortColumn = "title" | "artist" | "seenCount" | "playedAt";
type SortDirection = "asc" | "desc";

const FULL_PLAYLIST_URL = "https://music.youtube.com/playlist?list=PLL4Buq3mCcXM&si=2pZvH94Jq7fsxz16";
const GITHUB_REPO_URL = "https://github.com/theskybluestudio/ksbj-song-list";
const PAYPAL_DONATE_URL = "https://www.paypal.com/donate/?hosted_button_id=QS8KGBQ6L9RGW";

function formatPlayedDate(song: SongRecord) {
  if (song.playedAt) {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
    }).format(new Date(song.playedAt));
  }

  return song.dateText || "Unknown date";
}

function getSongLink(song: SongRecord) {
  return song.songLink ?? song.raw["Song Link"] ?? song.raw["song link"] ?? null;
}

function getRecencyCutoff(option: RecencyOption) {
  const now = Date.now();

  switch (option) {
    case "24h":
      return now - 24 * 60 * 60 * 1000;
    case "7d":
      return now - 7 * 24 * 60 * 60 * 1000;
    case "30d":
      return now - 30 * 24 * 60 * 60 * 1000;
    default:
      return null;
  }
}

function sortSongs(songs: SongRecord[], column: SortColumn, direction: SortDirection) {
  const factor = direction === "asc" ? 1 : -1;

  return [...songs].sort((a, b) => {
    let comparison = 0;

    switch (column) {
      case "artist":
        comparison = a.artist.localeCompare(b.artist) || a.title.localeCompare(b.title);
        break;
      case "seenCount":
        comparison = (a.seenCount ?? -1) - (b.seenCount ?? -1) || a.title.localeCompare(b.title);
        break;
      case "playedAt": {
        const aValue = a.playedAt ?? "";
        const bValue = b.playedAt ?? "";
        comparison = aValue.localeCompare(bValue) || a.title.localeCompare(b.title);
        break;
      }
      case "title":
      default:
        comparison = a.title.localeCompare(b.title) || a.artist.localeCompare(b.artist);
        break;
    }

    return comparison * factor;
  });
}

export function SongDashboard({
  songs,
  sourceLabel,
  usingSampleData,
  fetchedAt,
}: SongDashboardProps) {
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [recency, setRecency] = useState<RecencyOption>("all");
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);
  const [sortColumn, setSortColumn] = useState<SortColumn>("playedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("ksbj-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("ksbj-theme", theme);
  }, [mounted, theme]);

  useEffect(() => {
    setPage(1);
  }, [query, recency, pageSize, sortColumn, sortDirection]);

  const filteredSongs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const cutoff = getRecencyCutoff(recency);

    const results = songs.filter((song) => {
      if (normalizedQuery) {
        const haystack = `${song.title} ${song.artist}`.toLowerCase();
        if (!haystack.includes(normalizedQuery)) {
          return false;
        }
      }

      if (cutoff && song.playedAt) {
        return new Date(song.playedAt).getTime() >= cutoff;
      }

      if (cutoff && !song.playedAt) {
        return false;
      }

      return true;
    });

    return sortSongs(results, sortColumn, sortDirection);
  }, [query, recency, songs, sortColumn, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredSongs.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pagedSongs = filteredSongs.slice(pageStart, pageStart + pageSize);
  const recentlyPlayedSongs = sortSongs(songs, "playedAt", "desc").slice(0, 5);
  const mostPlayedSongs = sortSongs(songs, "seenCount", "desc").slice(0, 5);
  const latestSong = recentlyPlayedSongs[0];
  const totalSongCount = songs.length;
  const isDark = theme === "dark";

  function toggleSort(column: SortColumn) {
    if (sortColumn === column) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortColumn(column);
    setSortDirection(column === "seenCount" || column === "playedAt" ? "desc" : "asc");
  }

  const visiblePageNumbers = useMemo(() => {
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);
    return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
  }, [currentPage, totalPages]);

  return (
    <div
      className={`mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 transition-colors sm:px-6 lg:px-8 ${
        isDark ? "text-slate-100" : "text-slate-950"
      }`}
    >
      <section
        className={`rounded-3xl p-8 text-white shadow-lg ${
          isDark
            ? "bg-linear-to-br from-zinc-950 via-slate-900 to-purple-950 shadow-black/35"
            : "bg-linear-to-br from-sky-600 via-cyan-600 to-emerald-500 shadow-sky-950/20"
        }`}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">KSBJ song history</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">KSBJ recently played songs and full playlist.</h1>
              <button
                type="button"
                onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
                className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-white backdrop-blur transition ${
                  isDark
                    ? "border border-fuchsia-300/15 bg-zinc-800/55 hover:bg-zinc-700/65"
                    : "border border-white/30 bg-white/15 hover:bg-white/25"
                }`}
              >
                {isDark ? "Light theme" : "Dark theme"}
              </button>
            </div>
            <p className="max-w-3xl text-sm leading-6 text-white/85 sm:text-base">
              Browse recently played songs on KSBJ, explore the most-played Christian radio tracks, search by artist or title, and open the full YouTube Music playlist.
            </p>
          </div>
          <div
            className={`rounded-2xl px-4 py-3 text-sm backdrop-blur ${
              isDark ? "bg-zinc-900/55" : "bg-white/15"
            }`}
          >
            <div>Updated: {new Date(fetchedAt).toLocaleString()}</div>
            <div className="mt-2">
              <a
                href="https://ksbj.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 underline decoration-white/40 underline-offset-4 transition hover:decoration-white/80"
              >
                Visit KSBJ.org <span aria-hidden="true">↗</span>
              </a>
            </div>
            {usingSampleData ? <div className="mt-2 font-medium">Configure the sheet URL to go live.</div> : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <TopSongsBlock
          title="Last played 5"
          songs={recentlyPlayedSongs}
          isDark={isDark}
          secondary={(song) => formatPlayedDate(song)}
        />
        <TopSongsBlock
          title="Most played 5"
          songs={mostPlayedSongs}
          isDark={isDark}
          secondary={(song) => `${song.seenCount?.toLocaleString() ?? "—"} plays`}
        />
        <PlaylistBlock isDark={isDark} totalSongCount={totalSongCount} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section
          className={`rounded-3xl border p-5 shadow-sm ${
            isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
          }`}
        >
          <h2 className={`text-xl font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            Track KSBJ recently played songs
          </h2>
          <p className={`mt-3 max-w-4xl text-sm leading-7 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            This page tracks songs recently played on KSBJ and makes it easy to browse the latest rotation, find the most-played songs,
            and jump into the full playlist. Use it to check what was on KSBJ today, discover repeat favorites, and open song links in
            YouTube Music.
          </p>
        </section>

        <section
          className={`rounded-3xl border p-5 shadow-sm ${
            isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
          }`}
        >
          <h2 className={`text-xl font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>Feedback</h2>
          <p className={`mt-3 text-sm leading-7 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            Found a bad song link, missing track, or bug? Share feedback or report issues on GitHub.
          </p>
          <div className="mt-4">
            <a
              href={`${GITHUB_REPO_URL}/issues`}
              target="_blank"
              rel="noopener noreferrer"
              className={playButtonClass(isDark)}
            >
              Open GitHub Issues
            </a>
          </div>

          <div className={`mt-5 border-t pt-5 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
            <h3 className={`text-base font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>Support this project</h3>
            <p className={`mt-3 text-sm leading-7 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              This project was built to help KSBJ listeners quickly find recently played songs and enjoy the full playlist in one place.
              If you find it useful, your support helps cover hosting, maintenance, and future improvements. Every contribution helps keep it going.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a
                href={PAYPAL_DONATE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={playButtonClass(isDark)}
              >
                Support with PayPal
              </a>
              <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                Thank you for helping keep this project online and improving.
              </span>
            </div>
          </div>
        </section>
      </section>

      <section
        className={`grid gap-4 rounded-3xl border p-5 shadow-sm md:grid-cols-2 xl:grid-cols-4 xl:items-end ${
          isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
        }`}
      >
        <div className="space-y-2 xl:col-span-2">
          <label htmlFor="song-query" className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
            Search title or artist
          </label>
          <input
            id="song-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="MercyMe, Goodness of God, CeCe Winans…"
            className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ring-0 transition ${
              isDark
                ? "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:border-sky-400"
                : "border-slate-300 bg-white text-slate-900 focus:border-sky-500"
            }`}
          />
        </div>

        <SelectField
          id="song-recency"
          label="Last played within"
          value={recency}
          onChange={(value) => setRecency(value as RecencyOption)}
          isDark={isDark}
          options={[
            ["all", "All time"],
            ["24h", "Last 24 hours"],
            ["7d", "Last 7 days"],
            ["30d", "Last 30 days"],
          ]}
        />

        <SelectField
          id="song-page-size"
          label="Rows per page"
          value={String(pageSize)}
          onChange={(value) => setPageSize(Number(value))}
          isDark={isDark}
          options={[
            ["10", "10"],
            ["25", "25"],
            ["50", "50"],
            ["100", "100"],
          ]}
        />
      </section>

      <section
        className={`overflow-hidden rounded-3xl border shadow-sm ${
          isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
        }`}
      >
        <div className={`flex items-center justify-between border-b px-5 py-4 ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <div>
            <h2 className={`text-lg font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>Songs</h2>
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Showing {filteredSongs.length === 0 ? 0 : pageStart + 1}–{Math.min(pageStart + pageSize, filteredSongs.length)} of {filteredSongs.length}
            </p>
          </div>
          {latestSong ? (
            <div className={`text-right text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              <div className={`font-medium ${isDark ? "text-slate-100" : "text-slate-900"}`}>Most recently played</div>
              <div>{latestSong.title}</div>
              <div>{latestSong.artist}</div>
            </div>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y text-left text-sm">
            <thead className={isDark ? "sticky top-0 z-10 divide-slate-700 bg-slate-950 text-slate-300" : "sticky top-0 z-10 divide-slate-200 bg-slate-50 text-slate-600"}>
              <tr>
                <SortableHeader label="Song" column="title" activeColumn={sortColumn} direction={sortDirection} onClick={toggleSort} align="left" />
                <SortableHeader label="Artist" column="artist" activeColumn={sortColumn} direction={sortDirection} onClick={toggleSort} align="left" />
                <SortableHeader label="Seen count" column="seenCount" activeColumn={sortColumn} direction={sortDirection} onClick={toggleSort} align="right" />
                <th className="px-5 py-3 text-right font-medium">Listen</th>
                <SortableHeader label="Last played" column="playedAt" activeColumn={sortColumn} direction={sortDirection} onClick={toggleSort} align="left" />
              </tr>
            </thead>
            <tbody className={isDark ? "divide-y divide-slate-800" : "divide-y divide-slate-100"}>
              {pagedSongs.map((song) => {
                const songLink = getSongLink(song);

                return (
                  <tr key={song.id} className={isDark ? "hover:bg-slate-800/80" : "hover:bg-slate-50/80"}>
                    <td className={`px-5 py-3 font-medium ${isDark ? "text-slate-100" : "text-slate-900"}`}>{song.title}</td>
                    <td className={`px-5 py-3 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{song.artist}</td>
                    <td className={`px-5 py-3 text-right font-medium ${isDark ? "text-slate-100" : "text-slate-900"}`}>{song.seenCount?.toLocaleString() ?? "—"}</td>
                    <td className="px-5 py-3 text-right">
                      {songLink ? (
                        <a
                          href={songLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={playButtonClass(isDark)}
                        >
                          Play
                        </a>
                      ) : (
                        <span className={isDark ? "text-slate-500" : "text-slate-400"}>—</span>
                      )}
                    </td>
                    <td className={`whitespace-nowrap px-5 py-3 ${isDark ? "text-slate-300" : "text-slate-600"}`}>{formatPlayedDate(song)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className={`flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setPage(1)}
              disabled={currentPage === 1}
              className={pagerButtonClass(isDark, currentPage === 1)}
            >
              First
            </button>
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={currentPage === 1}
              className={pagerButtonClass(isDark, currentPage === 1)}
            >
              Prev
            </button>
            {visiblePageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                className={pagerNumberButtonClass(isDark, pageNumber === currentPage)}
              >
                {pageNumber}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              disabled={currentPage === totalPages}
              className={pagerButtonClass(isDark, currentPage === totalPages)}
            >
              Next
            </button>
            <button
              type="button"
              onClick={() => setPage(totalPages)}
              disabled={currentPage === totalPages}
              className={pagerButtonClass(isDark, currentPage === totalPages)}
            >
              Last
            </button>
          </div>
        </div>

        {pagedSongs.length === 0 ? (
          <div className={`px-5 py-10 text-center text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            No songs matched that search or time filter.
          </div>
        ) : null}
      </section>

      <footer className={`pb-2 text-center text-xs leading-6 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
        Unofficial KSBJ song tracker. Not affiliated with or endorsed by KSBJ.
      </footer>
    </div>
  );
}

function TopSongsBlock({
  title,
  songs,
  isDark,
  secondary,
}: {
  title: string;
  songs: SongRecord[];
  isDark: boolean;
  secondary: (song: SongRecord) => string;
}) {
  return (
    <section className={`rounded-3xl border p-5 shadow-sm ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className={`text-lg font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{title}</h2>
        <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{songs.length} songs</span>
      </div>
      <div className="space-y-3">
        {songs.map((song, index) => {
          const songLink = getSongLink(song);

          return (
            <div key={`${title}-${song.id}`} className={`flex items-start justify-between gap-3 rounded-2xl px-3 py-2 ${isDark ? "bg-slate-950/60" : "bg-slate-50"}`}>
              <div className="flex min-w-0 items-start gap-3">
                <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${isDark ? "bg-slate-800 text-slate-200" : "bg-slate-200 text-slate-700"}`}>
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <div className={`truncate text-sm font-medium ${isDark ? "text-slate-100" : "text-slate-900"}`}>{song.title}</div>
                  <div className={`truncate text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>{song.artist}</div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{secondary(song)}</div>
                {songLink ? (
                  <a
                    href={songLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={playButtonClass(isDark)}
                  >
                    Play
                  </a>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PlaylistBlock({
  isDark,
  totalSongCount,
}: {
  isDark: boolean;
  totalSongCount: number;
}) {
  return (
    <section className={`rounded-3xl border p-5 shadow-sm ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className={`text-lg font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>Full playlist</h2>
        <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{totalSongCount.toLocaleString()} songs</span>
      </div>
      <div
        className={`flex flex-col gap-3 rounded-2xl px-4 pt-4 pb-3 ${
          isDark ? "bg-slate-950/60" : "bg-slate-50"
        }`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className={`text-sm font-medium ${isDark ? "text-slate-100" : "text-slate-900"}`}>YouTube Music playlist</div>
            <a
              href={FULL_PLAYLIST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                isDark ? "bg-zinc-800/70 text-slate-300 hover:bg-zinc-700/80" : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              music.youtube.com ↗
            </a>
          </div>
          <p className={`text-sm leading-6 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Open the complete playlist and browse all tracked songs in one place.
          </p>
        </div>
      </div>
    </section>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  isDark,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
  isDark: boolean;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${
          isDark
            ? "border-slate-700 bg-slate-950 text-slate-100 focus:border-sky-400"
            : "border-slate-300 bg-white text-slate-900 focus:border-sky-500"
        }`}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
}

function SortableHeader({
  label,
  column,
  activeColumn,
  direction,
  onClick,
  align,
}: {
  label: string;
  column: SortColumn;
  activeColumn: SortColumn;
  direction: SortDirection;
  onClick: (column: SortColumn) => void;
  align: "left" | "right";
}) {
  const isActive = activeColumn === column;

  return (
    <th className={`px-5 py-3 ${align === "right" ? "text-right" : "text-left"}`}>
      <button
        type="button"
        onClick={() => onClick(column)}
        className={`inline-flex items-center gap-1 font-medium ${align === "right" ? "ml-auto" : ""}`}
      >
        <span>{label}</span>
        <span className="text-xs opacity-80">{!isActive ? "↕" : direction === "asc" ? "↑" : "↓"}</span>
      </button>
    </th>
  );
}

function playButtonClass(isDark: boolean) {
  return `inline-flex rounded-full px-3 py-1.5 text-xs font-semibold transition ${
    isDark
      ? "border border-fuchsia-300/10 bg-zinc-800/45 text-slate-200 hover:bg-zinc-700/55"
      : "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
  }`;
}

function pagerButtonClass(isDark: boolean, disabled: boolean) {
  return `rounded-full px-3 py-1.5 text-sm transition ${
    disabled
      ? isDark
        ? "cursor-not-allowed bg-slate-800 text-slate-500"
        : "cursor-not-allowed bg-slate-100 text-slate-400"
      : isDark
        ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
        : "bg-slate-100 text-slate-900 hover:bg-slate-200"
  }`;
}

function pagerNumberButtonClass(isDark: boolean, active: boolean) {
  return `rounded-full px-3 py-1.5 text-sm transition ${
    active
      ? isDark
        ? "bg-purple-700 text-white"
        : "bg-sky-600 text-white"
      : isDark
        ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
        : "bg-slate-100 text-slate-900 hover:bg-slate-200"
  }`;
}
