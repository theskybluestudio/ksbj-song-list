import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArtistSummaries, getArtistSummaryBySlug } from "@/lib/catalog";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

type ArtistPageProps = {
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
  const artists = await getArtistSummaries();
  return artists.slice(0, 250).map((artist) => ({ slug: artist.slug }));
}

export async function generateMetadata({ params }: ArtistPageProps): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getArtistSummaryBySlug(slug);

  if (!artist) {
    return {
      title: "Artist not found | Sky Blue Studio Music Tracker",
    };
  }

  const sourceText = artist.sources.map(sourceLabel).join(" and ");

  return {
    title: `Songs by ${artist.name} | Sky Blue Studio Music Tracker`,
    description: `${artist.name} appears across ${sourceText} with ${artist.songCount} tracked songs and ${artist.totalSeenCount.toLocaleString()} total observed plays.`,
    alternates: {
      canonical: `/artists/${artist.slug}`,
    },
    openGraph: {
      title: `Songs by ${artist.name} | Sky Blue Studio Music Tracker`,
      description: `${artist.name} appears across ${sourceText} with ${artist.songCount} tracked songs and ${artist.totalSeenCount.toLocaleString()} total observed plays.`,
      url: `/artists/${artist.slug}`,
      images: artist.thumbnailUrl ? [{ url: artist.thumbnailUrl }] : undefined,
    },
    twitter: {
      title: `Songs by ${artist.name} | Sky Blue Studio Music Tracker`,
      description: `${artist.name} appears across ${sourceText} with ${artist.songCount} tracked songs and ${artist.totalSeenCount.toLocaleString()} total observed plays.`,
      images: artist.thumbnailUrl ? [artist.thumbnailUrl] : undefined,
    },
  };
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { slug } = await params;
  const artist = await getArtistSummaryBySlug(slug);

  if (!artist) notFound();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Songs by ${artist.name}`,
    description: `${artist.name} appears across tracked music sources with ${artist.songCount} songs and ${artist.totalSeenCount.toLocaleString()} total observed plays.`,
    url: `${siteUrl}/artists/${artist.slug}`,
    inLanguage: "en-US",
    about: {
      "@type": "Thing",
      name: artist.name,
    },
    mainEntity: {
      "@type": "ItemList",
      name: `${artist.name} tracked songs`,
      itemListElement: artist.songs.slice(0, 100).map((song, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: song.title,
      })),
    },
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <nav className="text-sm text-slate-400">
          <Link href="/" className="hover:text-slate-200">Home</Link>
          <span className="px-2">/</span>
          <Link href="/artists" className="hover:text-slate-200">Artists</Link>
          <span className="px-2">/</span>
          <span className="text-slate-200">{artist.name}</span>
        </nav>

        <section className="rounded-3xl bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 p-8 text-white shadow-lg shadow-black/30">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">Artist page</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{artist.name}</h1>
              <p className="mt-4 text-sm leading-7 text-white/85 sm:text-base">
                {artist.name} appears across {artist.sources.map(sourceLabel).join(" and ")} with {artist.songCount.toLocaleString()} tracked songs and {artist.totalSeenCount.toLocaleString()} total observed plays.
              </p>
            </div>
            {artist.thumbnailUrl ? (
              <Image
                src={artist.thumbnailUrl}
                alt=""
                width={112}
                height={112}
                className="h-28 w-28 rounded-2xl object-cover"
                unoptimized
              />
            ) : null}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-sm">
            <div className="text-sm text-slate-400">Tracked songs</div>
            <div className="mt-2 text-3xl font-semibold text-slate-100">{artist.songCount.toLocaleString()}</div>
          </div>
          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-sm">
            <div className="text-sm text-slate-400">Observed plays</div>
            <div className="mt-2 text-3xl font-semibold text-slate-100">{artist.totalSeenCount.toLocaleString()}</div>
          </div>
          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-sm">
            <div className="text-sm text-slate-400">Latest seen</div>
            <div className="mt-2 text-3xl font-semibold text-slate-100">{formatDate(artist.latestPlayedAt)}</div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-700 bg-slate-900 shadow-sm">
          <div className="border-b border-slate-700 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-100">Tracked songs</h2>
            <p className="text-sm text-slate-400">Observed across {artist.sources.map(sourceLabel).join(" and ")}</p>
          </div>
          <div className="divide-y divide-slate-800">
            {artist.songs.map((song) => (
              <div key={`${song.source}-${song.id}`} className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,2fr)_96px_96px_140px] md:items-center">
                <div className="min-w-0">
                  <div className="truncate text-base font-medium text-slate-100">{song.title}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-400">
                    <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">{sourceLabel(song.source)}</span>
                    {song.songLink ? (
                      <a href={song.songLink} target="_blank" rel="noopener noreferrer" className="hover:text-slate-200">
                        Listen ↗
                      </a>
                    ) : null}
                  </div>
                </div>
                <div className="text-sm text-slate-300">{song.seenCount?.toLocaleString() ?? "—"} plays</div>
                <div className="text-sm text-slate-400">{formatDate(song.playedAt)}</div>
                <div className="text-sm text-slate-400">
                  <Link href={song.source === "ksbj" ? "/ksbj" : "/klove"} className="hover:text-slate-200">
                    View source →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

