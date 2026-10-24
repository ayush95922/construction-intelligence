import { useEffect, useState } from "react";
import { api } from "./api";
import { ErrorBoundary } from "./ui";
import Safety from "./features/Safety";
import Cracks from "./features/Cracks";
import Valuation from "./features/Valuation";
import Planning from "./features/Planning";
import Assistant from "./features/Assistant";
import Weather from "./features/Weather";
import Knowledge from "./features/Knowledge";

const ICONS = {
  safety: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  cracks: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
    </svg>
  ),
  valuation: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  planning: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  assistant: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  ),
  weather: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  ),
  knowledge: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
};

const FEATURES = [
  { id: "safety", name: "Site safety", category: "Computer Vision", about: "AI reviews a site photo for PPE and visible hazards. Not a certified inspection.", C: Safety },
  { id: "cracks", name: "Crack analysis", category: "Diagnostics", about: "AI describes a crack photo, possible causes and next steps. Not a structural diagnosis.", C: Cracks },
  { id: "valuation", name: "Property valuation", category: "Estimates", about: "An indicative, AI-generated value range, rent and return. Not verified market data.", C: Valuation },
  { id: "planning", name: "Project planning", category: "Scheduling", about: "A computed timeline plus approximate AI-estimated materials and costs.", C: Planning },
  { id: "assistant", name: "Daily site assistant", category: "Site Copilot", about: "Ask site questions or turn today's activities into a daily plan.", C: Assistant },
  { id: "weather", name: "Weather advisory", category: "Risk Analysis", about: "Live forecast or your own conditions, with GO / CAUTION / NO-GO guidance.", C: Weather },
  { id: "knowledge", name: "Knowledge assistant", category: "Reference Wiki", about: "Materials, methods and terminology explained.", C: Knowledge },
];

export default function App() {
  const [active, setActive] = useState("safety");
  const [health, setHealth] = useState(null);

  useEffect(() => {
    api("/api/health")
      .then((r) => setHealth(r.data.ai))
      .catch((e) => setHealth({ error: e.message }));
  }, []);

  const f = FEATURES.find((x) => x.id === active);

  return (
    <div className="min-h-screen bg-slate-50/60 lg:flex">
      {/* Sidebar navigation */}
      <aside className="bg-[#12171c] text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-72 lg:flex-col lg:shrink-0 lg:border-r lg:border-slate-800">
        <div className="tape" />
        
        {/* Brand header */}
        <div className="flex items-center gap-3.5 px-6 py-5 border-b border-slate-800/80">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-safety-d to-safety text-white shadow-md shadow-orange-950/40">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">Construction Intelligence</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">Site AI Platform</span>
          </div>
        </div>

        {/* Feature selector */}
        <nav aria-label="Features" className="flex gap-1.5 overflow-x-auto p-3.5 lg:flex-col lg:overflow-visible lg:flex-1 lg:space-y-1">
          {FEATURES.map((x) => {
            const isActive = x.id === active;
            return (
              <button
                key={x.id}
                onClick={() => setActive(x.id)}
                aria-current={isActive ? "page" : undefined}
                className={`group flex items-center gap-3 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-left font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-safety-d to-safety text-white shadow-md shadow-orange-950/30"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <span className={`${isActive ? "text-white" : "text-slate-400 group-hover:text-orange-400"} transition-colors`}>
                  {ICONS[x.id]}
                </span>
                <span className="flex-1 text-sm font-semibold tracking-wide">{x.name}</span>
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white shrink-0 hidden lg:inline-block shadow-xs" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer status */}
        <div className="hidden border-t border-slate-800/80 p-4 lg:block">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${health?.ready ? "bg-emerald-400 animate-pulse" : health?.error ? "bg-red-400" : "bg-amber-400"}`} />
              <span className="font-medium text-slate-300">{health?.ready ? "Gemini AI Active" : "Site Status"}</span>
            </span>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-400">v1.2</span>
          </div>
        </div>
      </aside>

      {/* Main content view */}
      <main className="min-w-0 flex-1 p-4 sm:p-8 blueprint-grid">
        <div className="mx-auto max-w-5xl space-y-6">
          <header className="rounded-2xl border border-line/80 bg-white/90 backdrop-blur-sm p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-safety-d">
                  <span>●</span> {f.category}
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-steel sm:text-4xl">{f.name}</h2>
                <p className="max-w-2xl text-sm sm:text-base text-mute leading-relaxed">{f.about}</p>
              </div>
              <div
                className="flex items-center gap-2 rounded-xl border border-line bg-slate-50/80 px-3.5 py-2 text-xs text-mute shadow-2xs"
                role="status"
              >
                <span className={`h-2 w-2 rounded-full ${health?.ready ? "bg-emerald-500" : health?.error ? "bg-bad" : "bg-warn"}`} />
                <span>{!health ? "Checking backend…" : health.error ? health.error : health.detail}</span>
              </div>
            </div>
          </header>

          <ErrorBoundary key={f.id}>
            <f.C />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}

