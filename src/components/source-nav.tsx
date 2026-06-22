import Link from "next/link";

const SOURCES = [
  { label: "Hub", href: "/", kind: "link" as const },
  { label: "KSBJ", href: "/ksbj", kind: "link" as const },
  { label: "K-LOVE", href: "/klove", kind: "link" as const },
  { label: "Source 03", kind: "placeholder" as const },
  { label: "Source 04", kind: "placeholder" as const },
];

export function SourceNav({
  isDark,
  currentPath,
}: {
  isDark: boolean;
  currentPath: "/" | "/ksbj" | "/klove";
}) {
  return (
    <nav
      aria-label="Source navigation"
      className={`rounded-3xl border p-4 shadow-sm ${
        isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        {SOURCES.map((source) => {
          if (source.kind === "link") {
            const isActive = source.href === currentPath;
            return (
              <Link
                key={source.label}
                href={source.href}
                className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? isDark
                      ? "bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-400/30"
                      : "bg-sky-100 text-sky-800 ring-1 ring-sky-300"
                    : isDark
                      ? "bg-slate-950 text-slate-300 hover:bg-slate-800"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {source.label}
              </Link>
            );
          }

          return (
            <span
              key={source.label}
              className={`inline-flex cursor-not-allowed items-center rounded-full px-3 py-1.5 text-sm ${
                isDark ? "bg-slate-950 text-slate-500" : "bg-slate-100 text-slate-400"
              }`}
            >
              {source.label} <span className="ml-2 text-xs uppercase tracking-wide">Soon</span>
            </span>
          );
        })}
      </div>
    </nav>
  );
}
