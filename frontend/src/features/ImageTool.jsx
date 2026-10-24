import { useEffect, useState } from "react";
import { Button, Empty, ErrorBox, Field, Panel, ResultMeta, Spinner, Textarea, useRequest } from "../ui";

const TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 8 * 1024 * 1024;
const kb = (n) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.ceil(n / 1024)} KB`);

/** Shared upload form for the two image features. `render(data)` draws the feature-specific result. */
export default function ImageTool({ endpoint, buttonLabel, descriptionLabel, descriptionHint, disclaimer, render }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [description, setDescription] = useState("");
  const [localError, setLocalError] = useState(null);
  const [inputKey, setInputKey] = useState(0);   // remounting the <input> lets the same file be chosen again
  const { run, reset, loading, error, result } = useRequest();

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const pick = (e) => {
    const f = e.target.files?.[0];
    setLocalError(null);
    if (!f) return;
    if (!TYPES.includes(f.type)) { setLocalError("Please choose a JPG, PNG or WebP image."); setFile(null); setPreview(null); return; }
    if (f.size > MAX_BYTES) { setLocalError(`That image is ${kb(f.size)}. The limit is 8 MB; please choose a smaller one.`); setFile(null); setPreview(null); return; }
    reset();
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };
  const submit = (e) => {
    e.preventDefault();
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    if (description.trim()) form.append("description", description.trim());
    run(endpoint, { form });
  };
  const another = () => {
    reset(); setFile(null); setPreview(null); setDescription(""); setLocalError(null); setInputKey((k) => k + 1);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Panel title="Upload photo">
        <form onSubmit={submit} className="space-y-4">
          <div className="rounded-xl border border-dashed border-line bg-slate-50/50 p-4 transition-colors hover:border-safety/60">
            <label className="block space-y-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-mute">Select site photo</span>
              <input
                key={inputKey}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={pick}
                aria-label="Choose an image"
                className="block w-full text-xs text-slate-500 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-orange-100/80 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-safety-d hover:file:bg-orange-200/80"
              />
            </label>
            <p className="mt-1.5 text-[11px] text-mute">Supported: JPG, PNG, WebP · Max 8 MB</p>
          </div>

          <ErrorBox message={localError} />

          {preview && (
            <figure className="overflow-hidden rounded-xl border border-line bg-slate-100/50 p-1.5 shadow-2xs">
              <img src={preview} alt="Selected upload" className="max-h-60 w-full rounded-lg object-contain bg-black/5" />
              <figcaption className="mt-2 flex items-center justify-between px-1 text-xs text-mute">
                <span className="truncate font-medium text-slate-700">{file.name}</span>
                <span className="font-mono text-xs">{kb(file.size)}</span>
              </figcaption>
            </figure>
          )}

          <Field label={descriptionLabel} hint={descriptionHint}>
            <Textarea rows={3} maxLength={1000} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>

          <div className="flex flex-wrap gap-2.5 pt-1">
            <Button type="submit" disabled={!file} loading={loading}>{buttonLabel}</Button>
            {(file || result || error) && <Button type="button" secondary onClick={another}>Analyse a different image</Button>}
          </div>
        </form>

        <div className="mt-5 rounded-lg border border-line/60 bg-slate-50/80 p-3 text-xs text-mute flex items-start gap-2">
          <svg className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="leading-relaxed">{disclaimer}</span>
        </div>
      </Panel>

      <div className="space-y-5">
        <ErrorBox message={error} />
        {loading && (
          <Panel>
            <div className="flex items-center gap-3 py-4 text-sm font-medium text-slate-700">
              <Spinner />
              <span>Analysing the image with AI. This can take up to a minute…</span>
            </div>
          </Panel>
        )}
        {!loading && !result && !error && (
          <Empty>Choose a JPG, PNG or WebP photo (up to 8 MB), optionally add a description, then run the analysis.</Empty>
        )}
        {result && (
          <Panel>
            <ResultMeta result={result} />
            {render(result.data || {})}
          </Panel>
        )}
      </div>
    </div>
  );
}
