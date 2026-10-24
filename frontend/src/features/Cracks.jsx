import ImageTool from "./ImageTool";
import { Block, arr, label, text } from "../ui";

const SEV = {
  none: { text: "text-good", bg: "bg-emerald-50 border-emerald-200" },
  minor: { text: "text-good", bg: "bg-emerald-50 border-emerald-200" },
  moderate: { text: "text-warn", bg: "bg-amber-50 border-amber-200" },
  severe: { text: "text-bad", bg: "bg-red-50 border-red-200" },
  cannot_determine: { text: "text-mute", bg: "bg-slate-50 border-slate-200" },
};
const URG = {
  routine_monitoring: "Routine monitoring",
  schedule_inspection: "Schedule an inspection",
  prompt_engineer_review: "Prompt engineer review",
  immediate_attention: "Immediate attention",
  cannot_determine: "Cannot be determined",
};

function Result({ d }) {
  const aid = d.opencv_aid;
  const sevStyle = SEV[d.severity] || { text: "text-mute", bg: "bg-slate-50 border-slate-200" };

  return (
    <div className="space-y-6">
      {/* Primary Diagnosis Card */}
      <div className={`rounded-xl border p-5 sm:p-6 ${sevStyle.bg} shadow-2xs space-y-3`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-mute">Diagnosis Summary</span>
            <p className={`font-display text-3xl sm:text-4xl font-extrabold tracking-tight ${sevStyle.text}`}>
              {label(d.crack_type) || "Unknown"} · {label(d.severity) || "unknown"}
            </p>
          </div>
          <div className="rounded-xl border border-line bg-white/95 px-4 py-2.5 text-right shadow-xs">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-mute">AI Confidence</span>
            <span className="text-sm font-bold text-steel">
              {d.severity ? "Inspection complete" : "Pending"}
            </span>
          </div>
        </div>

        <div className="grid gap-2 pt-1 text-sm sm:grid-cols-2">
          <div className="rounded-lg bg-white/80 p-3 border border-line/60">
            <p className="text-xs text-mute font-medium">Urgency</p>
            <p className="font-semibold text-steel"><strong>Urgency:</strong> {URG[d.urgency] || label(d.urgency) || "unknown"}</p>
          </div>
          <div className="rounded-lg bg-white/80 p-3 border border-line/60">
            <p className="text-xs text-mute font-medium">Dimension Estimate</p>
            <p className="font-semibold text-steel">
              <strong>Estimated crack width:</strong>{" "}
              {d.estimated_width_mm === null || d.estimated_width_mm === undefined
                ? "Not estimated (a width cannot be read reliably from an unscaled photo)"
                : `${d.estimated_width_mm} mm${d.width_basis ? ` (${d.width_basis})` : ""}`}
            </p>
          </div>
        </div>
      </div>

      <Block title="Visual observations" items={d.visual_observations} />
      <Block title="Possible causes" note="These are possibilities only. A photo cannot confirm the cause." items={d.possible_causes} />
      <Block title="Potential risks" items={d.potential_risks} />
      <Block title="Recommended actions" items={d.recommended_actions} />
      <Block title="Limitations" items={d.limitations} />

      {aid?.overlay_image && (
        <details className="rounded-xl border border-line bg-white p-4 shadow-2xs group">
          <summary className="cursor-pointer font-semibold text-steel flex items-center justify-between">
            <span>Optional image-filter aid (OpenCV)</span>
            <span className="text-xs text-safety-d font-medium">Toggle preview</span>
          </summary>
          <div className="mt-3 space-y-2 border-t border-line/60 pt-3">
            <p className="text-xs text-mute">{text(aid.label)}</p>
            <div className="overflow-hidden rounded-lg border border-line bg-slate-900/5 p-1">
              <img src={aid.overlay_image} alt="Photo with dark thin lines highlighted in red" className="max-h-96 w-full rounded object-contain" />
            </div>
            <p className="text-xs text-mute">
              Lines highlighted: {aid.lines_found ?? 0}. Longest: {aid.longest_percent_of_diagonal ?? 0}% of the image diagonal.
            </p>
          </div>
        </details>
      )}

      {d.model && <p className="text-xs text-mute text-right">Analysed by {d.model}.</p>}
    </div>
  );
}

export default function Cracks() {
  return (
    <ImageTool endpoint="/api/cracks/analyze" buttonLabel="Analyse crack"
      descriptionLabel="Location, age and symptoms (optional)" descriptionHint="For example: external wall, 8 years old, widening after monsoon."
      disclaimer="AI interprets this one photo. It cannot measure or diagnose. Cracks that are wide, growing, diagonal or near supports need a qualified structural engineer."
      render={(d) => <Result d={d} />} />
  );
}
