"use client";

import { useState } from "react";
import Receipt from "../Receipt";
import OrderActions from "./OrderActions";
import { formatDateTime } from "@/lib/format";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";

export default function AdminOrderDetail({ initialOrder, cafe }) {
  const [order, setOrder] = useState(initialOrder);
  return (
    <div className="mt-4 grid gap-6">
      <div className="no-print card p-4">
        <h1 className="text-2xl font-semibold">Manage order</h1>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <OrderActions order={order} onUpdated={setOrder} size="lg" />
          <button onClick={() => window.print()} className="btn-ghost btn-sm min-h-11">🖨 Print receipt</button>
        </div>
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer font-semibold text-coffee">Status history</summary>
          <ul className="mt-2 space-y-1 text-slate-ink">
            {order.history.map((h, i) => (
              <li key={i}>
                {formatDateTime(h.at)} — {h.type === "PAYMENT" ? `Payment: ${PAYMENT_STATUS_LABELS[h.value]}` : ORDER_STATUS_LABELS[h.value]}{" "}
                <span className="text-xs">({h.by})</span>
              </li>
            ))}
          </ul>
        </details>
      </div>
      <Receipt order={order} cafe={cafe} />
    </div>
  );
}
