"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DEFAULT_THEME, THEME_STORAGE_KEY, type ThemeMode } from "@/lib/theme";

const GITHUB_REPO_URL = "https://github.com/theskybluestudio/ksbj-song-list";
const PAYPAL_DONATE_URL = "https://www.paypal.com/donate/?hosted_button_id=QS8KGBQ6L9RGW";

export function HomeDashboard() {
  const [theme, setTheme] = useState<ThemeMode>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [mounted, theme]);

  const isDark = theme === "dark";

  return (
    <main className={`min-h-screen transition-colors ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-950"}`}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <section
          className={`rounded-3xl p-8 shadow-lg ${
            isDark
              ? "bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 text-white shadow-black/30"
              : "bg-linear-to-br from-sky-600 via-cyan-600 to-emerald-500 text-white shadow-sky-950/20"
          }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">THE SKYBLUE STUDIO</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Music tracker dashboards</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/85 sm:text-base">
                This hub collects music tracking pages by source. Start with the KSBJ tracker, and expand into more stations,
                playlists, or source-specific dashboards over time.
              </p>
            </div>
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
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Link
            href="/ksbj"
            className={`rounded-3xl border p-6 shadow-sm transition ${
              isDark
                ? "border-slate-800 bg-slate-900 hover:border-sky-500/40 hover:bg-slate-900/90"
                : "border-slate-200 bg-white hover:border-sky-500/40 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className={`text-sm font-semibold uppercase tracking-[0.18em] ${isDark ? "text-sky-300/80" : "text-sky-700"}`}>Source 01</div>
                <h2 className={`mt-3 text-2xl font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>KSBJ tracker</h2>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs ${isDark ? "border-slate-700 bg-slate-950 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-700"}`}>Live</span>
            </div>
            <p className={`mt-4 text-sm leading-7 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              Browse recently played songs, most-played tracks, playlist links, and summary charts for the KSBJ master list.
            </p>
            <div className={`mt-6 inline-flex items-center gap-2 text-sm font-medium ${isDark ? "text-sky-300" : "text-sky-700"}`}>
              Open dashboard <span aria-hidden="true">→</span>
            </div>
          </Link>
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
      </div>
    </main>
  );
}

function playButtonClass(isDark: boolean) {
  return `inline-flex rounded-full px-3 py-1.5 text-xs font-semibold transition ${
    isDark
      ? "border border-fuchsia-300/10 bg-zinc-800/45 text-slate-200 hover:bg-zinc-700/55"
      : "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
  }`;
}
