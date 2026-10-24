import { useRef, useState } from "react";
import { api } from "../api";
import { Button, ErrorBox, Input, ResultMeta } from "../ui";

export default function Chat({ endpoint, placeholder, suggestions = [] }) {
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const end = useRef(null);

  const send = async (q) => {
    const message = (q ?? text).trim();
    if (message.length < 2 || loading) return;
    const history = msgs.map(({ role, content }) => ({ role, content }));
    setMsgs((m) => [...m, { role: "user", content: message }]);
    setText(""); setError(null); setLoading(true);
    try {
      const r = await api(endpoint, { json: { message, history } });
      setMsgs((m) => [...m, { role: "assistant", content: r.data.answer, meta: r }]);
    } catch (e) { setError(e.message); }
    setLoading(false);
    setTimeout(() => end.current?.scrollIntoView({ block: "end" }), 0);
  };

  return (
    <div className="rounded-xl border border-line bg-paper shadow-xs overflow-hidden">
      <div className="max-h-[30rem] min-h-64 space-y-3.5 overflow-y-auto p-4 sm:p-5" aria-live="polite">
        {msgs.length === 0 && (
          <div className="space-y-3 text-mute py-4">
            <p className="text-xs font-bold uppercase tracking-wider text-mute">Ask a site question to start or try an example:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-line bg-white px-3.5 py-1.5 text-left text-xs font-semibold text-slate-700 shadow-2xs hover:border-safety hover:text-safety-d hover:shadow-xs transition-all cursor-pointer"
                >
                  ✦ {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-auto max-w-[85%] rounded-2xl rounded-tr-xs bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-3 text-white shadow-xs"
                : "max-w-[85%] rounded-2xl rounded-tl-xs border border-line bg-white px-4 py-3 text-slate-800 shadow-xs"
            }
          >
            {m.meta && <ResultMeta result={m.meta} />}
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs font-medium text-mute py-2">
            <span className="spin inline-block h-3.5 w-3.5 rounded-full border-2 border-safety border-t-transparent" />
            <span>AI Thinking…</span>
          </div>
        )}
        <div ref={end} />
      </div>
      <div className="space-y-2 border-t border-line/80 bg-slate-50/50 p-3.5">
        <ErrorBox message={error} />
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); send(); }}>
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} aria-label="Your question" />
          <Button type="submit" loading={loading}>Send</Button>
        </form>
      </div>
    </div>
  );
}
