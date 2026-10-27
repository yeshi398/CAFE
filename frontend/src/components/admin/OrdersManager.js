"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { adminFetch } from "./api";
import OrderActions from "./OrderActions";
import { OrderStatusBadge, PaymentBadge, OrderTypeBadge } from "../StatusBadge";
import { formatNu, formatDateTime, bhutanDateKey } from "@/lib/format";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/constants";

const REFRESH_MS = 15000;
const FILTER_KEYS = ["view", "status", "payment", "type", "from", "to", "q"];

export default function OrdersManager() {
  const router = useRouter();
  const params = useSearchParams();
  const [filters, setFilters] = useState(() => Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) || ""])));
  const [search, setSearch] = useState(filters.q);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ orders: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [newCount, setNewCount] = useState(0);
  const knownIds = useRef(null);

  const load = useCallback(
    async (quiet = false) => {
      if (!quiet) setLoading(true);
      try {
        const qs = new URLSearchParams(Object.entries({ ...filters, page }).filter(([, v]) => v));
        const d = await adminFetch(`/api/admin/orders?${qs}`);
        // Highlight orders that arrived since the last refresh
        const ids = new Set(d.orders.map((o) => o.orderId));
        if (knownIds.current && quiet) {
          const fresh = d.orders.filter((o) => !knownIds.current.has(o.orderId)).length;
          if (fresh) setNewCount((n) => n + fresh);
        }
        knownIds.current = ids;
        setData(d);
        setError("");
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [filters, page]
  );

  useEffect(() => {
    knownIds.current = null;
    load();
    const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v));
    router.replace(`/admin/orders${qs.size ? "?" + qs : ""}`, { scroll: false });
  }, [filters, page, load, router]);

  useEffect(() => {
    const t = setInterval(() => document.visibilityState === "visible" && load(true), REFRESH_MS);
    return () => clearInterval(t);
  }, [load]);

  const set = (k, v) => {
    setPage(1);
    setFilters((f) => ({ ...f, [k]: v }));
  };

  function onUpdated(updated) {
    setData((d) => ({ ...d, orders: d.orders.map((o) => (o.orderId === updated.orderId ? updated : o)) }));
  }

  const today = bhutanDateKey();
  const tabs = [
    ["active", "Open orders"],
    ["", "All orders"],
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Orders</h1>
          <p className="text-sm text-slate-ink">Refreshes every 15 seconds. {data.total} order(s) match.</p>
        </div>
        {newCount > 0 && (
          <button onClick={() => setNewCount(0)} className="chip bg-ember text-white text-sm px-4 py-1.5 animate-pulse">
            🔔 {newCount} new order{newCount > 1 ? "s" : ""}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mt-5 flex gap-2">
        {tabs.map(([v, label]) => (
          <button
            key={v}
            onClick={() => set("view", v)}
            className={`rounded-full px-4 h-10 text-sm font-semibold border-2 ${
              filters.view === v ? "bg-coffee text-foam border-coffee" : "border-coffee/15 text-coffee bg-foam"
            }`}
          >
            {label}
          </button>
        ))}
        <button onClick={() => setFilters({ view: "", status: "", payment: "", type: "", from: today, to: today, q: "" })} className="rounded-full px-4 h-10 text-sm font-semibold border-2 border-coffee/15 text-coffee bg-foam">
          Today
        </button>
      </div>

      {/* Filters */}
      <div className="card mt-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6">
        <form
          className="lg:col-span-2"
          onSubmit={(e) => {
            e.preventDefault();
            set("q", search.trim());
          }}
        >
          <span className="label">Search order ID</span>
          <div className="flex gap-2">
            <input className="field font-mono uppercase" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="e.g. 042 or CST-2026…" />
            <button className="btn-primary btn-sm min-h-12">Go</button>
          </div>
        </form>
        <Select label="Status" value={filters.status} onChange={(v) => set("status", v)}>
          <option value="">Any</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
        </Select>
        <Select label="Payment" value={filters.payment} onChange={(v) => set("payment", v)}>
          <option value="">Any</option>
          <option value="UNPAID">Unpaid</option>
          <option value="PAID">Paid</option>
        </Select>
        <Select label="Type" value={filters.type} onChange={(v) => set("type", v)}>
          <option value="">Any</option>
          <option value="TAKEAWAY">Takeaway</option>
          <option value="DINE_IN">Dine-in</option>
        </Select>
        <div className="grid grid-cols-2 gap-2 sm:col-span-2 lg:col-span-1 lg:grid-cols-1">
          <label><span className="label">From</span><input type="date" className="field" value={filters.from} max={filters.to || undefined} onChange={(e) => set("from", e.target.value)} /></label>
          <label><span className="label">To</span><input type="date" className="field" value={filters.to} min={filters.from || undefined} onChange={(e) => set("to", e.target.value)} /></label>
        </div>
        {Object.values(filters).some(Boolean) && (
          <button
            className="text-left text-sm font-semibold text-ember hover:underline lg:col-span-6"
            onClick={() => {
              setSearch("");
              setFilters(Object.fromEntries(FILTER_KEYS.map((k) => [k, ""])));
            }}
          >
            Clear all filters
          </button>
        )}
      </div>

      {error && <p role="alert" className="mt-4 rounded-xl bg-chili-soft px-4 py-3 font-semibold text-chili">{error}</p>}

      {/* List */}
      <div className="mt-4 space-y-3">
        {loading && data.orders.length === 0 && <p className="text-slate-ink">Loading…</p>}
        {!loading && data.orders.length === 0 && <div className="card p-8 text-center text-slate-ink">No orders match these filters.</div>}
        {data.orders.map((o) => {
          const isOpen = expanded === o.orderId;
          return (
            <article key={o.orderId} className={`card p-4 ${o.orderStatus === "READY" ? "ring-2 ring-sage" : ""} ${o.orderStatus === "CANCELLED" ? "opacity-70" : ""}`}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <button onClick={() => setExpanded(isOpen ? null : o.orderId)} className="font-mono text-lg font-bold hover:text-ember" aria-expanded={isOpen}>
                  {o.orderId}
                </button>
                <span className="text-sm text-slate-ink">{formatDateTime(o.createdAt)}</span>
                <OrderTypeBadge type={o.orderType} table={o.tableNumber} />
                <span className="ml-auto flex items-center gap-2">
                  <OrderStatusBadge status={o.orderStatus} />
                  <PaymentBadge status={o.paymentStatus} />
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-3 text-sm">
                <span className="font-bold">{o.customerName}</span>
                {o.customerPhone && <a href={`tel:${o.customerPhone}`} className="text-ember hover:underline">{o.customerPhone}</a>}
                <span className="text-slate-ink">{o.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}</span>
                <span className="ml-auto font-display text-xl font-semibold text-coffee tabular-nums">{formatNu(o.totalAmount)}</span>
              </div>
              {o.specialInstructions && (
                <p className="mt-2 rounded-lg bg-saffron/20 px-3 py-1.5 text-sm"><strong>Note:</strong> {o.specialInstructions}</p>
              )}

              {isOpen && (
                <div className="mt-3 rounded-xl bg-cream/70 p-3 text-sm">
                  <table className="w-full">
                    <tbody>
                      {o.items.map((i, idx) => (
                        <tr key={idx}><td>{i.quantity}× {i.name}</td><td className="text-right tabular-nums">{formatNu(i.unitPrice)}</td><td className="text-right tabular-nums font-semibold">{formatNu(i.lineTotal)}</td></tr>
                      ))}
                      {o.charges.map((c) => (
                        <tr key={c.label}><td colSpan={2}>{c.label}</td><td className="text-right tabular-nums">{formatNu(c.amount)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-2 text-xs text-slate-ink">
                    History: {o.history.map((h) => `${h.value.toLowerCase()} (${new Date(h.at).toLocaleTimeString("en-GB", { timeZone: "Asia/Thimphu", hour: "2-digit", minute: "2-digit" })})`).join(" → ")}
                  </p>
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-coffee/10 pt-3">
                <OrderActions order={o} onUpdated={onUpdated} />
                <Link href={`/admin/orders/${o.orderId}`} className="text-sm font-semibold text-ember hover:underline">Receipt →</Link>
              </div>
            </article>
          );
        })}
      </div>

      {data.pages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-3">
          <button className="btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Newer</button>
          <span className="text-sm text-slate-ink">Page {page} of {data.pages}</span>
          <button className="btn-ghost btn-sm" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>Older →</button>
        </div>
      )}
    </div>
  );
}

function Select({ label, value, onChange, children }) {
  return (
    <label>
      <span className="label">{label}</span>
      <select className="field" value={value} onChange={(e) => onChange(e.target.value)}>{children}</select>
    </label>
  );
}
