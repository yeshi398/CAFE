"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OrderStatusBadge, PaymentBadge, OrderTypeBadge } from "./StatusBadge";
import { getMyOrders } from "@/lib/myOrders";
import { formatNu, formatDateTime, formatTime } from "@/lib/format";
import { ORDER_STATUS_LABELS, STATUS_FLOW } from "@/lib/constants";

const REFRESH_MS = 15000;

export default function OrderTracker() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get("id") || "";
  const [input, setInput] = useState(initial);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mine, setMine] = useState([]);
  const current = useRef(null);

  useEffect(() => setMine(getMyOrders()), []);

  const lookup = useCallback(async (id, { quiet = false } = {}) => {
    const clean = id.trim().toUpperCase().replace(/\s+/g, "");
    if (!clean) return;
    if (!/^CST-\d{8}-\d{3,6}$/.test(clean)) {
      setError("That doesn't look like an Order ID. It should look like CST-20261020-001.");
      setOrder(null);
      return;
    }
    if (!quiet) { setLoading(true); setError(""); }
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(clean)}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (!quiet) { setOrder(null); setError(data.error || "Order not found."); }
        return;
      }
      current.current = clean;
      setOrder(data.order);
      setError("");
    } catch {
      if (!quiet) setError("Network problem. Please try again.");
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initial) lookup(initial);
  }, [initial, lookup]);

  // Auto-refresh while the order is still in progress
  useEffect(() => {
    if (!order || ["COMPLETED", "CANCELLED"].includes(order.orderStatus)) return;
    const t = setInterval(() => current.current && lookup(current.current, { quiet: true }), REFRESH_MS);
    return () => clearInterval(t);
  }, [order, lookup]);

  function submit(e) {
    e.preventDefault();
    const clean = input.trim().toUpperCase();
    router.replace(`/track-order?id=${encodeURIComponent(clean)}`, { scroll: false });
    lookup(clean);
  }

  const stepIndex = order ? STATUS_FLOW.indexOf(order.orderStatus) : -1;
  const myToken = order && mine.find((m) => m.orderId === order.orderId)?.token;

  return (
    <div className="pb-10">
      <form onSubmit={submit} className="mt-6 flex gap-2">
        <label className="flex-1">
          <span className="sr-only">Order ID</span>
          <input
            className="field font-mono uppercase tracking-wide"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="CST-20261020-001"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <button className="btn-primary" disabled={loading}>{loading ? "Checking…" : "Track"}</button>
      </form>

      {error && <p role="alert" className="mt-4 rounded-xl bg-chili-soft px-4 py-3 font-semibold text-chili">{error}</p>}

      {order && (
        <section className="card mt-6 p-6" aria-live="polite">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-ink">Order</p>
              <p className="font-mono text-2xl font-bold">{order.orderId}</p>
              <p className="text-sm text-slate-ink">{order.customerName} · placed {formatDateTime(order.createdAt)}</p>
            </div>
            <OrderTypeBadge type={order.orderType} table={order.tableNumber} />
          </div>

          {order.orderStatus === "CANCELLED" ? (
            <p className="mt-6 rounded-xl bg-chili-soft p-4 font-semibold text-chili">
              This order was cancelled. Please speak to the café staff if you have questions.
            </p>
          ) : (
            <ol className="mt-6 grid grid-cols-4 gap-1" aria-label="Order progress">
              {STATUS_FLOW.map((s, i) => {
                const done = i <= stepIndex;
                const at = order.history.find((h) => h.value === s)?.at;
                return (
                  <li key={s} className="text-center">
                    <div className={`h-2 rounded-full ${done ? (s === "READY" && i === stepIndex ? "bg-sage" : "bg-ember") : "bg-crema"}`} />
                    <p className={`mt-2 text-[11px] sm:text-xs font-semibold leading-tight ${done ? "text-coffee" : "text-slate-ink/60"}`}>
                      {ORDER_STATUS_LABELS[s]}
                    </p>
                    {at && <p className="text-[10px] text-slate-ink">{formatTime(at)}</p>}
                  </li>
                );
              })}
            </ol>
          )}

          {order.orderStatus === "READY" && (
            <p className="mt-5 rounded-xl bg-sage p-4 text-center font-display text-xl font-semibold text-white">
              🔔 Your order is ready — please collect it at the counter!
            </p>
          )}

          <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-coffee/10 pt-4 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-ink">Status</dt>
              <dd className="mt-1"><OrderStatusBadge status={order.orderStatus} /></dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-ink">Payment</dt>
              <dd className="mt-1"><PaymentBadge status={order.paymentStatus} /></dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-ink">Amount</dt>
              <dd className="mt-1 font-bold">{formatNu(order.totalAmount)}</dd>
            </div>
          </dl>
          {order.paymentStatus === "UNPAID" && order.orderStatus !== "CANCELLED" && (
            <p className="mt-4 text-sm text-slate-ink">Pay {formatNu(order.totalAmount)} in cash at the counter when you collect.</p>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            {myToken && (
              <Link href={`/order/${order.orderId}?t=${encodeURIComponent(myToken)}`} className="btn-ghost btn-sm min-h-11">
                View receipt
              </Link>
            )}
            {!["COMPLETED", "CANCELLED"].includes(order.orderStatus) && (
              <p className="self-center text-xs text-slate-ink">Updates automatically every 15 seconds.</p>
            )}
          </div>
        </section>
      )}

      {mine.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Your recent orders on this device</h2>
          <ul className="mt-3 space-y-2">
            {mine.map((m) => (
              <li key={m.orderId}>
                <button
                  type="button"
                  onClick={() => {
                    setInput(m.orderId);
                    router.replace(`/track-order?id=${m.orderId}`, { scroll: false });
                    lookup(m.orderId);
                  }}
                  className="card flex w-full items-center justify-between px-4 py-3 text-left hover:border-ember/40"
                >
                  <span className="font-mono font-bold">{m.orderId}</span>
                  <span className="text-sm text-slate-ink">
                    {m.totalAmount != null ? formatNu(m.totalAmount) + " · " : ""}
                    {formatDateTime(m.at)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
