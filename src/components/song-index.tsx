"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { SongSummary } from "@/lib/catalog";
import { buildArtistSlug } from "@/lib/slug";

function formatUpdated(value: string | null) {
  if (!value) return "Unknown";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}

export function SongIndex({ songs }: { songs: SongSummary[] }) {
  const [query, setQuery] = useState("");

  const filteredSongs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return songs;

    return songs.filter((song) => {
      const haystack = `${song.title} ${song.artist} ${song.sources.join(" ")}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [songs, query]);

  return (
    <>
      <section className="rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-sm">
        <label htmlFor="song-index-query" className="text-sm font-medium text-slate-200">
          Search songs or artists
        </label>
        <input
          id="song-index-query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Goodness of God, CeCe Winans, K-LOVE…"
          className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400"
        />
      </section>

      <section className="rounded-3xl border border-slate-700 bg-slate-900 shadow-sm">
        <div className="border-b border-slate-700 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-100">Songs</h2>
          <p className="text-sm text-slate-400">{filteredSongs.length.toLocaleString()} matching song pages</p>
        </div>
        <div className="divide-y divide-slate-800">
          {filteredSongs.map((song) => (
            <Link
              key={song.slug}
              href={`/songs/${song.slug}`}
              className="grid gap-3 px-5 py-4 transition hover:bg-slate-800/80 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)_120px_160px] md:items-center"
            >
              <div className="flex min-w-0 items-start gap-3">
                {song.thumbnailUrl ? (
                  <Image src={song.thumbnailUrl} alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-lg object-cover" unoptimized />
                ) : (
                  <div className="h-12 w-12 shrink-0 rounded-lg bg-slate-800" />
                )}
                <div className="min-w-0">
                  <div className="truncate text-base font-medium text-slate-100">{song.title}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {song.sources.map((source) => (
                      <span key={`${song.slug}-${source}`} className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
                        {source.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="min-w-0 text-sm text-slate-300">
                <Link href={`/artists/${buildArtistSlug(song.artist)}`} className="hover:text-slate-100 hover:underline">
                  {song.artist}
                </Link>
              </div>
              <div className="text-sm text-slate-300">{song.totalSeenCount.toLocaleString()} plays</div>
              <div className="text-sm text-slate-400">Updated {formatUpdated(song.latestPlayedAt)}</div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

