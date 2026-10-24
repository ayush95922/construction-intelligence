import { useState } from "react";
import { Block, Button, Empty, ErrorBox, Field, Input, List, Notice, Panel, ResultMeta, Select, Spinner, Textarea, arr, label, text, useRequest } from "../ui";

const LEVEL = {
  ok: ["Go", "text-good"], caution: ["Caution", "text-warn"], avoid: ["Avoid", "text-bad"], unknown: ["No data", "text-mute"],
};
const DECISION = {
  GO: ["GO", "text-good", "bg-emerald-50 border-emerald-300 text-emerald-800"],
  CAUTION: ["CAUTION", "text-warn", "bg-amber-50 border-amber-300 text-amber-800"],
  NO_GO: ["NO-GO", "text-bad", "bg-red-50 border-red-300 text-red-800"],
};
const num = (v) => (v === "" ? null : +v);

export default function Weather() {
  const [f, setF] = useState({ location: "", days: 5, planned: "", tmax: "", tmin: "", rain: "", wind: "", note: "" });
  const { run, loading, error, result } = useRequest();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    const manual = { temperature_max_c: num(f.tmax), temperature_min_c: num(f.tmin), rain_mm: num(f.rain), wind_kmh: num(f.wind), description: f.note || null };
    run("/api/weather/advisory", { json: { location: f.location.trim() || null, days: +f.days, planned_activities: f.planned || null, manual } });
  };
  const d = result?.data;
  const g = d?.ai_guidance;
  const [decText, decCls, decBox] = DECISION[g?.decision] || ["", "", ""];

  return (
    <div className="space-y-6">
      <Panel title="Site and planned work">
        <form onSubmit={submit} className="space-y-4">
          <div className="flex flex-wrap items-end gap-3.5">
            <div className="w-full sm:w-72">
              <Field label="City or town">
                <Input value={f.location} onChange={set("location")} placeholder="e.g. Mumbai, Indore, Bangalore" />
              </Field>
            </div>
            <div className="w-36">
              <Field label="Days">
                <Select options={[1, 2, 3, 5, 7]} value={f.days} onChange={set("days")} />
              </Field>
            </div>
          </div>
          <Field label="Planned activities (optional)">
            <Textarea rows={2} value={f.planned} onChange={set("planned")} placeholder="e.g. slab pour on level 2, crane lifting in the afternoon" />
          </Field>
          <details className="rounded-xl border border-line bg-slate-50/60 p-4 transition-colors">
            <summary className="cursor-pointer font-semibold text-steel flex items-center justify-between">
              <span>Enter weather conditions myself</span>
              <span className="text-xs text-mute">Manual override</span>
            </summary>
            <p className="my-2 text-xs text-mute">Used only when live weather can't be retrieved, or when you leave the location empty. Results will be labelled as your own input.</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mt-3">
              <Field label="Max temp (°C)"><Input type="number" value={f.tmax} onChange={set("tmax")} /></Field>
              <Field label="Min temp (°C)"><Input type="number" value={f.tmin} onChange={set("tmin")} /></Field>
              <Field label="Rain (mm)"><Input type="number" min="0" value={f.rain} onChange={set("rain")} /></Field>
              <Field label="Wind (km/h)"><Input type="number" min="0" value={f.wind} onChange={set("wind")} /></Field>
            </div>
            <div className="mt-3"><Field label="Notes"><Input value={f.note} onChange={set("note")} placeholder="e.g. heavy cloud, storm expected" /></Field></div>
          </details>
          <Button type="submit" loading={loading}>Get advisory</Button>
        </form>
      </Panel>
      <ErrorBox message={error} />
      {loading && <Panel><div className="flex items-center gap-3 py-3 text-sm text-slate-700"><Spinner /> <span>Fetching weather and preparing guidance…</span></div></Panel>}
      {!d && !loading && !error && <Empty>Enter a location (forecast from Open-Meteo) or your own conditions to get GO / CAUTION / NO-GO guidance.</Empty>}
      {d && (<>
        <Panel>
          <ResultMeta result={result} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-mute">Weather source: {d.weather_source}</p>
              {d.location && <h3 className="text-2xl font-bold text-steel mt-0.5">{[d.location.name, d.location.region, d.location.country].filter(Boolean).join(", ")}</h3>}
            </div>
            {d.current && (
              <div className="rounded-xl border border-line bg-slate-50/80 px-4 py-2 text-right shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-mute block">Current Conditions</span>
                <p className="text-sm font-semibold text-steel">
                  Now: {d.current.temperature_2m}°C · wind {d.current.wind_speed_10m} km/h · rain {d.current.precipitation} mm
                </p>
              </div>
            )}
          </div>
        </Panel>
        {g ? (
          <Panel title="AI guidance">
            <div className={`mb-4 inline-block rounded-xl border px-5 py-3 ${decBox || "bg-slate-50 border-line"}`}>
              <span className="text-xs font-bold uppercase tracking-wider text-mute block">Site Operations Decision</span>
              <p className={`font-display text-4xl sm:text-5xl font-extrabold tracking-tight ${decCls}`}>{decText}</p>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-slate-800 bg-white/70 p-3.5 rounded-lg border border-line/60">{g.rationale}</p>
            <div className="mt-4 space-y-3">
              <Block title="Precautions" items={g.precautions} />
              <Block title="Mitigation steps" items={g.mitigation_steps} />
              <Block title="Limitations" items={g.limitations} />
            </div>
          </Panel>
        ) : <Notice>{d.ai_error ? `AI guidance is unavailable: ${d.ai_error} The rule-based results below are still based on the weather data above.` : null}</Notice>}
        <div className="grid gap-4 md:grid-cols-2">
          {arr(d.days).map((day) => (
            <Panel key={day.date} className="hover:border-slate-300">
              <div className="flex items-center justify-between border-b border-line/60 pb-2.5 mb-2.5">
                <h3 className="text-lg font-bold text-steel">{new Date(day.date + "T00:00").toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" })}</h3>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                  {day.tmin ?? "–"} to {day.tmax ?? "–"}°C
                </span>
              </div>
              <p className="mb-3 text-xs text-mute flex items-center gap-2">
                <span>Rain: {day.rain ?? "–"} mm{day.prob != null ? ` (${day.prob}%)` : ""}</span>
                <span>·</span>
                <span>Wind: {day.wind ?? "–"} km/h</span>
              </p>
              <ul className="space-y-2">
                {arr(day.advisories).map((a) => {
                  const [name, cls] = LEVEL[a.level] || [label(a.level), ""];
                  return (
                    <li key={a.activity} className="rounded-lg border border-line/60 bg-slate-50/50 p-2.5 text-xs sm:text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{a.activity}</span>
                        <span className={`font-bold ${cls}`}>{name}</span>
                      </div>
                      {a.level !== "ok" && <span className="block mt-1 text-xs text-mute">{text(a.reason)}</span>}
                    </li>);
                })}
              </ul>
            </Panel>))}
        </div>
        <Panel title="Rule thresholds used"><List items={d.rules} /></Panel>
      </>)}
    </div>
  );
}
