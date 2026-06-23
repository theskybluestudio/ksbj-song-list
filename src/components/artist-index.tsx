"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ArtistSummary } from "@/lib/catalog";

function formatUpdated(value: string | null) {
  if (!value) return "Unknown";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}

export function ArtistIndex({ artists }: { artists: ArtistSummary[] }) {
  const [query, setQuery] = useState("");

  const filteredArtists = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return artists;

    return artists.filter((artist) => {
      const haystack = `${artist.name} ${artist.sources.join(" ")}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [artists, query]);

  return (
    <>
      <section className="rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-sm">
        <label htmlFor="artist-query" className="text-sm font-medium text-slate-200">
          Search artists
        </label>
        <input
          id="artist-query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="CeCe Winans, MercyMe, KSBJ…"
          className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400"
        />
      </section>

      <section className="rounded-3xl border border-slate-700 bg-slate-900 shadow-sm">
        <div className="border-b border-slate-700 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-100">Artists</h2>
          <p className="text-sm text-slate-400">{filteredArtists.length.toLocaleString()} matching artist pages</p>
        </div>
        <div className="divide-y divide-slate-800">
          {filteredArtists.map((artist) => (
            <Link
              key={artist.slug}
              href={`/artists/${artist.slug}`}
              className="grid gap-3 px-5 py-4 transition hover:bg-slate-800/80 md:grid-cols-[minmax(0,2fr)_120px_120px_160px] md:items-center"
            >
              <div>
                <div className="text-base font-medium text-slate-100">{artist.name}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {artist.sources.map((source) => (
                    <span key={`${artist.slug}-${source}`} className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
                      {source.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-sm text-slate-300">{artist.songCount.toLocaleString()} songs</div>
              <div className="text-sm text-slate-300">{artist.totalSeenCount.toLocaleString()} plays</div>
              <div className="text-sm text-slate-400">Updated {formatUpdated(artist.latestPlayedAt)}</div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

