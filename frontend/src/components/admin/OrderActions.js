"use client";

import { useState } from "react";
import { adminFetch } from "./api";

const NEXT = {
  RECEIVED: { status: "PREPARING", label: "Start preparing" },
  PREPARING: { status: "READY", label: "Mark ready" },
};

/**
 * Buttons for moving an order along. The server enforces the same rules;
 * the UI just hides actions that would be refused.
 */
export default function OrderActions({ order, onUpdated, size = "sm" }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const open = !["COMPLETED", "CANCELLED"].includes(order.orderStatus);
  const paid = order.paymentStatus === "PAID";

  async function update(changes, confirmText) {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(true);
    setError("");
    try {
      const { order: updated } = await adminFetch(`/api/admin/orders/${order.orderId}`, { method: "PATCH", body: changes });
      onUpdated?.(updated);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return <p className="text-xs text-slate-ink">{order.orderStatus === "COMPLETED" ? "Completed – no further changes." : "Cancelled."}</p>;
  }

  const cls = size === "lg" ? "min-h-11" : "min-h-9";
  const next = NEXT[order.orderStatus];

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {next && (
          <button disabled={busy} onClick={() => update({ orderStatus: next.status })} className={`btn-primary btn-sm ${cls}`}>
            {next.label}
          </button>
        )}
        {!paid && (
          <button
            disabled={busy}
            onClick={() => update({ paymentStatus: "PAID" }, `Confirm you received Nu. ${order.totalAmount} in cash for ${order.orderId}?`)}
            className={`btn-success btn-sm ${cls}`}
          >
            💵 Mark paid
          </button>
        )}
        {!paid && (
          <button
            disabled={busy}
            onClick={() =>
              update(
                { paymentStatus: "PAID", orderStatus: "COMPLETED" },
                `Customer paid Nu. ${order.totalAmount} and collected ${order.orderId}?`
              )
            }
            className={`btn-accent btn-sm ${cls}`}
          >
            Paid & collected
          </button>
        )}
        {paid && (
          <button disabled={busy} onClick={() => update({ orderStatus: "COMPLETED" })} className={`btn-accent btn-sm ${cls}`}>
            ✓ Collected – complete
          </button>
        )}
        {paid && (
          <button
            disabled={busy}
            onClick={() => update({ paymentStatus: "UNPAID" }, "Undo payment? Use this only to fix a mistake or after a refund.")}
            className={`btn-ghost btn-sm ${cls}`}
          >
            Undo payment
          </button>
        )}
        {!paid && (
          <button
            disabled={busy}
            onClick={() => update({ orderStatus: "CANCELLED" }, `Cancel order ${order.orderId}? This cannot be undone.`)}
            className={`btn-sm ${cls} btn-ghost !text-chili !border-chili/30`}
          >
            Cancel
          </button>
        )}
      </div>
      {error && <p role="alert" className="mt-2 text-sm font-semibold text-chili">{error}</p>}
    </div>
  );
}
