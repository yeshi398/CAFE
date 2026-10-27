"use client";

import { useState } from "react";
import { adminFetch } from "./api";

export default function SettingsForm({ initial }) {
  const [s, setS] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const set = (k, v) => setS((x) => ({ ...x, [k]: v }));

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    setError("");
    setErrors({});
    try {
      const saved = await adminFetch("/api/admin/settings", {
        method: "PUT",
        body: { ...s, tableCount: Number(s.tableCount), takeawayCharge: Number(s.takeawayCharge) },
      });
      setS(saved);
      setMsg("Settings saved ✓");
    } catch (err) {
      setError(err.message);
      setErrors(err.fields || {});
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="mt-6 space-y-6">
      <section className={`card p-5 ${s.acceptingOrders ? "" : "ring-2 ring-chili"}`}>
        <label className="flex items-center justify-between gap-4">
          <span>
            <span className="block text-lg font-bold text-coffee">Accept online orders</span>
            <span className="block text-sm text-slate-ink">Turn off when the café is closed or too busy. Customers can still browse the menu.</span>
          </span>
          <input type="checkbox" className="h-7 w-7 accent-sage" checked={s.acceptingOrders} onChange={(e) => set("acceptingOrders", e.target.checked)} />
        </label>
      </section>

      <section className="card grid gap-4 p-5 sm:grid-cols-2">
        <h2 className="text-xl font-semibold sm:col-span-2">Café details</h2>
        <F label="Café name" error={errors.cafeName}><input className="field" value={s.cafeName} onChange={(e) => set("cafeName", e.target.value)} /></F>
        <F label="Phone" error={errors.phone}><input className="field" value={s.phone} onChange={(e) => set("phone", e.target.value)} /></F>
        <F label="Email" error={errors.email}><input className="field" value={s.email} onChange={(e) => set("email", e.target.value)} /></F>
        <F label="Number of tables (0 = don't check)" error={errors.tableCount}>
          <input className="field" type="number" min="0" max="200" value={s.tableCount} onChange={(e) => set("tableCount", e.target.value)} />
        </F>
        <F label="Location" error={errors.location} className="sm:col-span-2"><input className="field" value={s.location} onChange={(e) => set("location", e.target.value)} /></F>
        <F label="Opening hours (one line per row)" error={errors.openingHours} className="sm:col-span-2">
          <textarea className="field min-h-24 py-3" value={s.openingHours} onChange={(e) => set("openingHours", e.target.value)} />
        </F>
      </section>

      <section className="card grid gap-4 p-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <h2 className="text-xl font-semibold">Extra charges</h2>
          <p className="text-sm text-slate-ink">Added automatically to takeaway orders. Set to 0 for no charge. Existing orders are not affected.</p>
        </div>
        <F label="Takeaway charge (Nu. per order)" error={errors.takeawayCharge}>
          <input className="field" type="number" min="0" step="0.5" value={s.takeawayCharge} onChange={(e) => set("takeawayCharge", e.target.value)} />
        </F>
        <F label="Label on the bill" error={errors.takeawayChargeLabel}>
          <input className="field" value={s.takeawayChargeLabel} onChange={(e) => set("takeawayChargeLabel", e.target.value)} />
        </F>
      </section>

      {error && <p role="alert" className="rounded-xl bg-chili-soft px-4 py-3 font-semibold text-chili">{error}</p>}
      {msg && <p role="status" className="rounded-xl bg-sage-soft px-4 py-3 font-semibold text-sage">{msg}</p>}
      <button className="btn-primary" disabled={saving}>{saving ? "Saving…" : "Save settings"}</button>
    </form>
  );
}

function F({ label, error, className = "", children }) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      {children}
      {error && <span className="mt-1 block text-sm font-semibold text-chili">{error}</span>}
    </label>
  );
}
