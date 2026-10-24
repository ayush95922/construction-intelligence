import ImageTool from "./ImageTool";
import { Block, arr, label, text } from "../ui";

const STATUS = {
  low_concern: ["Low concern", "text-good", "bg-emerald-50 border-emerald-200"],
  moderate_concern: ["Moderate concern", "text-warn", "bg-amber-50 border-amber-200"],
  high_concern: ["High concern", "text-bad", "bg-red-50 border-red-200"],
  cannot_determine: ["Cannot be determined from this photo", "text-mute", "bg-slate-50 border-slate-200"],
};
const SEVERITY = {
  low: { text: "text-good", bg: "bg-emerald-50 border-emerald-200", border: "border-l-emerald-500" },
  medium: { text: "text-warn", bg: "bg-amber-50 border-amber-200", border: "border-l-amber-500" },
  high: { text: "text-bad", bg: "bg-red-50 border-red-200", border: "border-l-red-500" },
  critical: { text: "text-bad", bg: "bg-red-50 border-red-200", border: "border-l-red-600" },
};
const PPE = { worn: "Worn", not_worn: "Not worn", not_visible: "Not visible", uncertain: "Uncertain" };
const PPE_STYLE = {
  worn: "bg-emerald-50 text-emerald-700 border-emerald-200",
  not_worn: "bg-red-50 text-red-700 border-red-200",
  not_visible: "bg-slate-100 text-slate-600 border-slate-200",
  uncertain: "bg-amber-50 text-amber-700 border-amber-200",
};

function Result({ d }) {
  const [statusText, statusCls, statusBg] = STATUS[d.overall_status] || [label(d.overall_status) || "Unknown", "text-mute", "bg-slate-50 border-slate-200"];
  const ppe = d.ppe_detection || {};
  const hazards = arr(d.hazards);
  const scoreVal = d.safety_score;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className={`rounded-xl border p-5 sm:p-6 ${statusBg} shadow-2xs`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-mute">Safety Assessment</span>
            <p className={`font-display text-3xl sm:text-4xl font-extrabold tracking-tight ${statusCls}`}>{statusText}</p>
          </div>
          <div className="rounded-xl border border-line bg-white/95 px-4 py-2.5 text-right shadow-xs">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-mute">Site Rating</span>
            <span className="font-display text-2xl font-bold text-steel">
              {scoreVal !== null && scoreVal !== undefined ? `${scoreVal} pts` : "Unrated"}
            </span>
          </div>
        </div>

        <p className="mt-3 text-sm">
          <strong>AI-estimated safety indicator:</strong>{" "}
          {scoreVal === null || scoreVal === undefined ? "not available" : `${scoreVal} / 100`}
        </p>
        <p className="text-xs text-mute mt-0.5">{text(d.safety_score_label)}</p>
        {d.scene_summary && (
          <p className="mt-3 text-sm text-slate-800 leading-relaxed rounded-lg bg-white/80 p-3 border border-line/60">
            {d.scene_summary}
          </p>
        )}
      </div>

      {/* PPE Observed */}
      <div className="rounded-xl border border-line bg-white p-5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-line/60 pb-3">
          <h3 className="text-base font-bold text-steel">PPE observed</h3>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {ppe.people_visible === null || ppe.people_visible === undefined ? "People visible: unclear" : `People visible: ${ppe.people_visible}`}
          </span>
        </div>
        <p className="mt-2 text-xs text-mute">
          {ppe.people_visible === null || ppe.people_visible === undefined ? "Number of people visible: unclear." : `People visible: ${ppe.people_visible}.`} {text(ppe.summary)}
        </p>
        {arr(ppe.items).length ? (
          <div className="mt-3 overflow-x-auto rounded-lg border border-line">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr className="border-b border-line">
                  <th className="px-3.5 py-2.5 font-semibold">Item</th>
                  <th className="px-3.5 py-2.5 font-semibold">Status</th>
                  <th className="px-3.5 py-2.5 font-semibold">Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {arr(ppe.items).map((it, i) => {
                  const style = PPE_STYLE[it.status] || "bg-slate-100 text-slate-600 border-slate-200";
                  return (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-3.5 py-2.5 font-semibold text-slate-800">{text(it.item)}</td>
                      <td className="px-3.5 py-2.5">
                        <span className={`inline-block rounded-md border px-2 py-0.5 text-xs font-semibold ${style}`}>
                          {PPE[it.status] || label(it.status)}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-mute">{text(it.evidence)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-xs text-mute">No PPE items could be assessed in this photo.</p>
        )}
      </div>

      {/* Hazards */}
      <div className="rounded-xl border border-line bg-white p-5 shadow-2xs">
        <h3 className="text-base font-bold text-steel mb-3">Hazards</h3>
        {hazards.length ? (
          <ul className="space-y-3">
            {hazards.map((h, i) => {
              const sev = SEVERITY[h.severity] || { text: "", bg: "", border: "border-l-slate-400" };
              return (
                <li key={i} className={`rounded-lg border border-line border-l-4 ${sev.border} bg-white p-4 shadow-2xs space-y-2`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`font-bold text-sm ${sev.text}`}>{label(h.severity)} severity</span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-mute">
                      {h.basis === "observed" ? "Observed in the photo" : "Inferred (interpretation)"}
                    </span>
                  </div>
                  <p className="text-base font-semibold text-slate-900">{text(h.description)}</p>
                  <p className="text-xs text-slate-700"><strong>Evidence:</strong> {text(h.evidence)}</p>
                  <p className="text-xs text-slate-700 bg-amber-50/60 rounded p-2 border border-amber-200/60">
                    <strong>Corrective action:</strong> {text(h.corrective_action)}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-xs text-mute">The AI did not report any hazards visible in this photo. That is not a guarantee that none exist.</p>
        )}
      </div>

      <Block title="Recommendations" items={d.recommendations} />
      <Block title="Limitations" items={d.limitations} />
      {d.model && <p className="text-xs text-mute text-right">Analysed by {d.model}.</p>}
    </div>
  );
}

export default function Safety() {
  return (
    <ImageTool endpoint="/api/safety/analyze" buttonLabel="Analyse photo"
      descriptionLabel="Description (optional)" descriptionHint="For example: which area or floor, what work is happening."
      disclaimer="AI reads only what is visible in this one photo. It is not a certified safety inspection and does not check compliance with any standard."
      render={(d) => <Result d={d} />} />
  );
}
