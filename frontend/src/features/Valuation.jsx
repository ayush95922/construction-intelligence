import { useState } from "react";
import { Block, Button, Empty, ErrorBox, Field, Input, Panel, ResultMeta, Select, Spinner, inr, label, useRequest } from "../ui";

const TYPES = [
  { value: "apartment", label: "Apartment" }, { value: "independent_house", label: "Independent house" },
  { value: "villa", label: "Villa" }, { value: "plot", label: "Plot" }, { value: "commercial", label: "Commercial" },
];

export default function Valuation() {
  const [f, setF] = useState({ city: "", locality: "", property_type: "apartment", area_sqft: "", bedrooms: 2, bathrooms: 2,
    age_years: 5, condition: "good", floor: 0, amenities: "", local_rate_per_sqft: "" });
  const { run, loading, error, result } = useRequest();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    run("/api/valuation", { json: {
      city: f.city, locality: f.locality || null, property_type: f.property_type, condition: f.condition,
      area_sqft: +f.area_sqft, bedrooms: +f.bedrooms, bathrooms: +f.bathrooms, age_years: +f.age_years, floor: +f.floor,
      local_rate_per_sqft: f.local_rate_per_sqft ? +f.local_rate_per_sqft : null,
      amenities: f.amenities.split(",").map((s) => s.trim()).filter(Boolean),
    } });
  };
  const d = result?.data;

  return (
    <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
      <Panel title="Property details">
        <form onSubmit={submit} className="space-y-3">
          <Field label="City"><Input required value={f.city} onChange={set("city")} /></Field>
          <Field label="Locality (optional)"><Input value={f.locality} onChange={set("locality")} /></Field>
          <Field label="Property type"><Select options={TYPES} value={f.property_type} onChange={set("property_type")} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Area (sq ft)"><Input required type="number" min="101" value={f.area_sqft} onChange={set("area_sqft")} /></Field>
            <Field label="Age (years)"><Input type="number" min="0" value={f.age_years} onChange={set("age_years")} /></Field>
            <Field label="Bedrooms"><Input type="number" min="0" value={f.bedrooms} onChange={set("bedrooms")} /></Field>
            <Field label="Bathrooms"><Input type="number" min="0" value={f.bathrooms} onChange={set("bathrooms")} /></Field>
            <Field label="Floor"><Input type="number" min="0" value={f.floor} onChange={set("floor")} /></Field>
            <Field label="Condition"><Select options={["poor", "fair", "good", "excellent"]} value={f.condition} onChange={set("condition")} /></Field>
          </div>
          <Field label="Amenities" hint="Comma separated, e.g. lift, parking, security"><Input value={f.amenities} onChange={set("amenities")} /></Field>
          <Field label="Local rate per sq ft in ₹ (optional)" hint="If you know a verified local rate, enter it. The AI will anchor to it."><Input type="number" min="1" value={f.local_rate_per_sqft} onChange={set("local_rate_per_sqft")} /></Field>
          <Button type="submit" loading={loading}>Estimate</Button>
        </form>
      </Panel>
      <div className="space-y-4">
        <ErrorBox message={error} />
        {loading && <Panel><span className="flex items-center gap-3"><Spinner /> Estimating…</span></Panel>}
        {!d && !loading && !error && <Empty>Enter the property details to get an indicative, AI-generated estimate. It is not verified market data.</Empty>}
        {d && (<>
          <Panel>
            <ResultMeta result={result} />
            <div className="rounded-xl border border-line bg-gradient-to-br from-slate-50 to-orange-50/20 p-5 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-mute">Indicative value range</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-steel">
                  Confidence: {label(d.confidence)}
                </span>
              </div>
              <p className="mt-1 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-steel">
                {inr(d.estimated_value_low)} to {inr(d.estimated_value_high)}
              </p>
              <p className="mt-2 text-xs sm:text-sm text-mute">
                Midpoint <span className="font-semibold text-slate-800">{inr(d.estimated_value_mid)}</span> · about{" "}
                <span className="font-semibold text-slate-800">{inr(d.price_per_sqft_low)} to {inr(d.price_per_sqft_high)}</span> per sq ft
              </p>
              {d.data_source && <p className="mt-3 text-xs text-mute/80 border-t border-line/50 pt-2">{d.data_source}</p>}
            </div>
          </Panel>
          <Panel title="Rental income and return (indicative)">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-line/70 bg-white p-3.5 shadow-2xs">
                <span className="text-xs text-mute font-medium block">Monthly rent</span>
                <span className="text-base font-bold text-steel">{inr(d.monthly_rent_low)} to {inr(d.monthly_rent_high)}</span>
              </div>
              <div className="rounded-lg border border-line/70 bg-white p-3.5 shadow-2xs">
                <span className="text-xs text-mute font-medium block">Gross rental yield</span>
                <span className="text-base font-bold text-emerald-700">{d.gross_rental_yield_pct}% per year</span>
              </div>
              <div className="rounded-lg border border-line/70 bg-white p-3.5 shadow-2xs">
                <span className="text-xs text-mute font-medium block">Appreciation (assumed)</span>
                <span className="text-base font-bold text-steel">{d.appreciation_pct_per_year_low}% to {d.appreciation_pct_per_year_high}% per year</span>
              </div>
              <div className="rounded-lg border border-line/70 bg-white p-3.5 shadow-2xs">
                <span className="text-xs text-mute font-medium block">Indicative total return</span>
                <span className="text-base font-bold text-safety-d">{d.indicative_annual_return_pct_low}% to {d.indicative_annual_return_pct_high}% per year</span>
              </div>
            </div>
            {d.return_note && <p className="mt-3 text-xs text-mute">{d.return_note}</p>}
          </Panel>
          <Panel><div className="space-y-4">
            <Block title="Key factors" items={d.key_factors} />
            <Block title="Assumptions" items={d.assumptions} />
            <Block title="Limitations" items={d.limitations} />
          </div></Panel>
        </>)}
      </div>
    </div>
  );
}
