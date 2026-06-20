import type { Metadata } from "next";
import Link from "next/link";
import { siteDescription, siteName, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Music Sources | Sky Blue Studio Music Tracker",
  description: "Browse music tracking dashboards by source, starting with the KSBJ master list.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Music Sources | Sky Blue Studio Music Tracker",
    description: "Browse music tracking dashboards by source, starting with the KSBJ master list.",
    url: "/",
  },
  twitter: {
    title: "Music Sources | Sky Blue Studio Music Tracker",
    description: "Browse music tracking dashboards by source, starting with the KSBJ master list.",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: siteName,
  description: siteDescription,
  url: siteUrl,
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    name: "Music tracking sources",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "KSBJ tracker",
        url: `${siteUrl}/ksbj`,
      },
    ],
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-3xl bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 p-8 shadow-lg shadow-black/30">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">THE SKYBLUE STUDIO</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Music tracker dashboards</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            This hub collects music tracking pages by source. Start with the KSBJ master list, and expand into more stations,
            playlists, or source-specific dashboards over time.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Link
            href="/ksbj"
            className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-sm transition hover:border-sky-500/40 hover:bg-slate-900/90"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-300/80">Source 01</div>
                <h2 className="mt-3 text-2xl font-semibold text-slate-100">KSBJ tracker</h2>
              </div>
              <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-300">Live</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Browse recently played songs, most-played tracks, playlist links, and summary charts for the KSBJ master list.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-sky-300">
              Open dashboard <span aria-hidden="true">→</span>
            </div>
          </Link>
        </section>
      </div>
    </main>
  );
}
