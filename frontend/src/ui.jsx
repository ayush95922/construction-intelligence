import { Component, useState } from "react";
import { api } from "./api";

export const arr = (x) => (Array.isArray(x) ? x : []);
export const text = (x) => (x === null || x === undefined ? "" : String(x));

export function useRequest() {
  const [state, set] = useState({ loading: false, error: null, result: null });
  const run = async (path, opts) => {
    set({ loading: true, error: null, result: null });
    try { set({ loading: false, error: null, result: await api(path, opts) }); }
    catch (e) { set({ loading: false, error: e.message, result: null }); }
  };
  const reset = () => set({ loading: false, error: null, result: null });
  return { ...state, run, reset };
}

export const Panel = ({ title, children, className = "" }) => (
  <section className={`rounded-xl border border-line bg-paper p-5 sm:p-6 shadow-xs transition-shadow duration-200 hover:shadow-sm ${className}`}>
    {title && (
      <div className="mb-4 flex items-center gap-2 border-b border-line/70 pb-3">
        <span className="h-4 w-1 rounded-full bg-safety" />
        <h2 className="text-xl font-bold tracking-tight text-steel">{title}</h2>
      </div>
    )}
    {children}
  </section>
);

const inputCls = "w-full rounded-lg border border-line bg-white px-3.5 py-2 text-base text-ink placeholder:text-mute/50 focus:border-safety focus:ring-4 focus:ring-safety/10 focus:outline-none transition-all duration-150 shadow-2xs";

export const Field = ({ label, hint, children }) => (
  <label className="block space-y-1">
    <span className="block text-xs font-bold uppercase tracking-wider text-mute">{label}</span>
    {children}
    {hint && <span className="block text-xs text-mute/80">{hint}</span>}
  </label>
);

export const Input = (p) => <input className={inputCls} {...p} />;

export const Select = ({ options, ...p }) => (
  <select className={inputCls} {...p}>
    {options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
  </select>
);

export const Textarea = (p) => <textarea className={inputCls} {...p} />;

export const Button = ({ loading, children, secondary, ...p }) => (
  <button
    disabled={loading || p.disabled}
    className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-sm transition-all duration-150 cursor-pointer active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none ${
      secondary
        ? "border border-line bg-white text-steel hover:bg-slate-50 hover:border-slate-300 shadow-2xs"
        : "bg-gradient-to-r from-safety-d to-safety text-white shadow-xs hover:shadow-md hover:shadow-safety/20 hover:brightness-105"
    }`}
    {...p}
  >
    {loading && <Spinner small />}{children}
  </button>
);

export const Spinner = ({ small }) => (
  <span role="status" aria-label="Loading"
    className={`spin inline-block rounded-full border-2 border-current border-t-transparent ${small ? "h-3.5 w-3.5" : "h-5 w-5"}`} />
);

export const ErrorBox = ({ message }) => message ? (
  <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50/90 px-4 py-3 text-bad shadow-2xs">
    <svg className="h-5 w-5 shrink-0 text-bad mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
    <div className="flex-1 text-sm font-medium leading-relaxed">{message}</div>
  </div>
) : null;

export const Notice = ({ children }) => children ? (
  <div role="status" className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/90 px-4 py-3 text-warn shadow-2xs">
    <svg className="h-5 w-5 shrink-0 text-warn mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <div className="flex-1 text-sm font-medium leading-relaxed">{children}</div>
  </div>
) : null;

const MODE = {
  ai: ["AI generated", "bg-emerald-50 text-emerald-800 border-emerald-200", "✦"],
  partial: ["Partial result: AI part unavailable", "bg-amber-50 text-amber-800 border-amber-200", "⚠"],
};

export function ResultMeta({ result }) {
  if (!result) return null;
  const [label, cls, icon] = MODE[result.mode] || MODE.ai;
  return (
    <div className="mb-3 space-y-1.5">
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
        <span>{icon}</span> {label}
      </span>
      {arr(result.notes).map((n, i) => <p key={i} className="text-xs text-mute">{n}</p>)}
    </div>
  );
}

export const List = ({ items }) => (
  <ul className="space-y-1 pl-1 text-sm">
    {arr(items).map((t, i) => (
      <li key={i} className="flex items-start gap-2">
        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-safety" />
        <span className="flex-1">{text(t)}</span>
      </li>
    ))}
  </ul>
);

/** Heading + bullet list; renders nothing when there are no items. */
export const Block = ({ title, items, note }) => arr(items).length ? (
  <div className="rounded-lg border border-line/60 bg-white p-3.5 shadow-2xs">
    <h3 className="text-sm font-bold uppercase tracking-wider text-steel">{title}</h3>
    {note && <p className="mb-1 text-xs text-mute">{note}</p>}
    <List items={items} />
  </div>
) : null;

export const Empty = ({ children }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-paper/60 p-8 text-center text-mute">
    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    </div>
    <p className="max-w-md text-sm leading-relaxed">{children}</p>
  </div>
);

export const inr = (n) => (n === null || n === undefined || Number.isNaN(Number(n)) ? "n/a" : `₹ ${Number(n).toLocaleString("en-IN")}`);
export const label = (s) => text(s).replace(/_/g, " ");

/** Keeps one broken result from blanking the whole app. */
export class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(err) { console.error("UI render error", err); }
  render() {
    return this.state.failed ? (
      <div role="alert" className="rounded-lg border border-bad bg-red-50 p-4 text-bad shadow-xs">
        Something went wrong while showing this result. Please try again.{" "}
        <button className="underline font-semibold cursor-pointer" onClick={() => this.setState({ failed: false })}>Dismiss</button>
      </div>
    ) : this.props.children;
  }
}
