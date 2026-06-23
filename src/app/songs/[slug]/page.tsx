import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSongSummaries, getSongSummaryBySlug } from "@/lib/catalog";
import { buildArtistSlug } from "@/lib/slug";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

type SongPageProps = {
  params: Promise<{ slug: string }>;
};

function formatDate(value: string | null) {
  if (!value) return "Unknown";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}

function sourceLabel(source: "ksbj" | "klove") {
  return source === "ksbj" ? "KSBJ" : "K-LOVE";
}

export async function generateStaticParams() {
  const songs = await getSongSummaries();
  return songs.slice(0, 500).map((song) => ({ slug: song.slug }));
}

export async function generateMetadata({ params }: SongPageProps): Promise<Metadata> {
  const { slug } = await params;
  const song = await getSongSummaryBySlug(slug);

  if (!song) return { title: "Song not found | Sky Blue Studio Music Tracker" };

  const sourceText = song.sources.map(sourceLabel).join(" and ");
  const description = `${song.title} by ${song.artist} appears across ${sourceText} with ${song.totalSeenCount.toLocaleString()} total observed plays.`;

  return {
    title: `${song.title} — ${song.artist} | Sky Blue Studio Music Tracker`,
    description,
    alternates: { canonical: `/songs/${song.slug}` },
    openGraph: {
      title: `${song.title} — ${song.artist} | Sky Blue Studio Music Tracker`,
      description,
      url: `/songs/${song.slug}`,
      images: song.thumbnailUrl ? [{ url: song.thumbnailUrl }] : undefined,
    },
    twitter: {
      title: `${song.title} — ${song.artist} | Sky Blue Studio Music Tracker`,
      description,
      images: song.thumbnailUrl ? [song.thumbnailUrl] : undefined,
    },
  };
}

export default async function SongPage({ params }: SongPageProps) {
  const { slug } = await params;
  const song = await getSongSummaryBySlug(slug);
  if (!song) notFound();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    name: song.title,
    byArtist: {
      "@type": "MusicGroup",
      name: song.artist,
      url: `${siteUrl}/artists/${buildArtistSlug(song.artist)}`,
    },
    url: `${siteUrl}/songs/${song.slug}`,
    image: song.thumbnailUrl ?? undefined,
    inLanguage: "en-US",
    isPartOf: { "@type": "WebSite", name: "Sky Blue Studio Music Tracker", url: siteUrl },
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <nav className="text-sm text-slate-400">
          <Link href="/" className="hover:text-slate-200">Home</Link>
          <span className="px-2">/</span>
          <Link href="/songs" className="hover:text-slate-200">Songs</Link>
          <span className="px-2">/</span>
          <span className="text-slate-200">{song.title}</span>
        </nav>

        <section className="rounded-3xl bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 p-8 text-white shadow-lg shadow-black/30">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">Song page</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{song.title}</h1>
              <p className="mt-4 text-sm leading-7 text-white/85 sm:text-base">
                {song.title} by {song.artist} appears across {song.sources.map(sourceLabel).join(" and ")} with {song.totalSeenCount.toLocaleString()} total observed plays.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/80">
                <Link href={`/artists/${buildArtistSlug(song.artist)}`} className="underline decoration-white/40 underline-offset-4 hover:decoration-white/80">
                  Artist: {song.artist}
                </Link>
                {song.primarySongLink ? (
                  <a href={song.primarySongLink} target="_blank" rel="noopener noreferrer" className="underline decoration-white/40 underline-offset-4 hover:decoration-white/80">
                    Listen ↗
                  </a>
                ) : null}
              </div>
            </div>
            {song.thumbnailUrl ? (
              <Image src={song.thumbnailUrl} alt="" width={112} height={112} className="h-28 w-28 rounded-2xl object-cover" unoptimized />
            ) : null}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-sm">
            <div className="text-sm text-slate-400">Observed plays</div>
            <div className="mt-2 text-3xl font-semibold text-slate-100">{song.totalSeenCount.toLocaleString()}</div>
          </div>
          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-sm">
            <div className="text-sm text-slate-400">Sources</div>
            <div className="mt-2 text-3xl font-semibold text-slate-100">{song.sources.length}</div>
          </div>
          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-sm">
            <div className="text-sm text-slate-400">Latest seen</div>
            <div className="mt-2 text-3xl font-semibold text-slate-100">{formatDate(song.latestPlayedAt)}</div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-700 bg-slate-900 shadow-sm">
          <div className="border-b border-slate-700 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-100">Tracked appearances</h2>
            <p className="text-sm text-slate-400">Observed across {song.sources.map(sourceLabel).join(" and ")}</p>
          </div>
          <div className="divide-y divide-slate-800">
            {song.variants.map((variant) => (
              <div key={`${variant.source}-${variant.id}`} className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,2fr)_96px_96px_140px] md:items-center">
                <div className="flex min-w-0 items-start gap-3">
                  {variant.thumbnailUrl ? (
                    <Image src={variant.thumbnailUrl} alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-lg object-cover" unoptimized />
                  ) : (
                    <div className="h-12 w-12 shrink-0 rounded-lg bg-slate-800" />
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-base font-medium text-slate-100">{variant.artist}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-400">
                      <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">{sourceLabel(variant.source)}</span>
                      {variant.songLink ? <a href={variant.songLink} target="_blank" rel="noopener noreferrer" className="hover:text-slate-200">Listen ↗</a> : null}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-slate-300">{variant.seenCount?.toLocaleString() ?? "—"} plays</div>
                <div className="text-sm text-slate-400">{formatDate(variant.playedAt)}</div>
                <div className="text-sm text-slate-400">
                  <Link href={variant.source === "ksbj" ? "/ksbj" : "/klove"} className="hover:text-slate-200">View source →</Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

