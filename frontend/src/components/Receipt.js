import Logo from "./Logo";
import { OrderStatusBadge, PaymentBadge } from "./StatusBadge";
import { formatNu, formatDateTime } from "@/lib/format";
import { ORDER_TYPE_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, ORDER_STATUS_LABELS } from "@/lib/constants";

/** Printable digital receipt. Pure component – works on server and client. */
export default function Receipt({ order, cafe }) {
  return (
    <article className="print-area card mx-auto max-w-xl overflow-hidden" aria-label={`Receipt for order ${order.orderId}`}>
      <div className="kira-band h-2" aria-hidden="true" />
      <header className="px-6 pt-6 text-center">
        <div className="flex justify-center"><Logo size={52} /></div>
        <p className="mt-2 font-display text-2xl font-semibold text-coffee">{cafe?.cafeName || "CST Café"}</p>
        <p className="text-xs text-slate-ink">College of Science and Technology, Phuentsholing</p>
        {cafe && (
          <p className="text-xs text-slate-ink">
            {cafe.phone}
            {cafe.email ? ` · ${cafe.email}` : ""}
          </p>
        )}
      </header>

      <div className="mx-6 mt-5 rounded-2xl bg-crema/60 px-4 py-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-ink">Order ID</p>
        <p className="font-mono text-2xl sm:text-3xl font-bold tracking-wide text-espresso">{order.orderId}</p>
      </div>

      <dl className="mx-6 mt-5 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <Row label="Date & time" value={formatDateTime(order.createdAt)} />
        <Row label="Customer" value={order.customerName} />
        <Row label="Order type" value={ORDER_TYPE_LABELS[order.orderType]} />
        {order.orderType === "DINE_IN" && <Row label="Table" value={order.tableNumber} />}
        {order.customerPhone && <Row label="Phone" value={order.customerPhone} />}
      </dl>

      <table className="mx-6 mt-5 w-[calc(100%-3rem)] text-sm">
        <thead>
          <tr className="border-y border-dashed border-coffee/25 text-left text-xs uppercase tracking-wider text-slate-ink">
            <th className="py-2 font-semibold">Item</th>
            <th className="py-2 text-center font-semibold">Qty</th>
            <th className="py-2 text-right font-semibold">Price</th>
            <th className="py-2 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((i, idx) => (
            <tr key={idx} className="align-top">
              <td className="py-1.5 pr-2">{i.name}</td>
              <td className="py-1.5 text-center tabular-nums">{i.quantity}</td>
              <td className="py-1.5 text-right tabular-nums whitespace-nowrap">{formatNu(i.unitPrice)}</td>
              <td className="py-1.5 text-right tabular-nums whitespace-nowrap font-semibold">{formatNu(i.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t border-dashed border-coffee/25">
          <tr>
            <td colSpan={3} className="pt-2 text-slate-ink">Subtotal</td>
            <td className="pt-2 text-right tabular-nums">{formatNu(order.subtotal)}</td>
          </tr>
          {order.charges.map((c) => (
            <tr key={c.label}>
              <td colSpan={3} className="text-slate-ink">{c.label}</td>
              <td className="text-right tabular-nums">{formatNu(c.amount)}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={3} className="pt-3 font-display text-lg font-semibold text-coffee">Total payable</td>
            <td className="pt-3 text-right font-display text-xl font-semibold text-ember tabular-nums whitespace-nowrap">
              {formatNu(order.totalAmount)}
            </td>
          </tr>
        </tfoot>
      </table>

      {order.specialInstructions && (
        <p className="mx-6 mt-4 rounded-xl border border-coffee/10 bg-white px-3 py-2 text-sm">
          <span className="font-semibold text-coffee">Note: </span>
          {order.specialInstructions}
        </p>
      )}

      <dl className="mx-6 mt-5 grid grid-cols-2 gap-3 border-t border-dashed border-coffee/25 pt-4 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wider text-slate-ink">Payment method</dt>
          <dd className="font-semibold">{PAYMENT_METHOD_LABELS[order.paymentMethod] || "Cash at Café Counter"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-slate-ink">Payment status</dt>
          <dd className="mt-0.5">
            <span className="print:hidden"><PaymentBadge status={order.paymentStatus} /></span>
            <span className="hidden print:inline font-semibold">{PAYMENT_STATUS_LABELS[order.paymentStatus]}</span>
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs uppercase tracking-wider text-slate-ink">Order status</dt>
          <dd className="mt-0.5">
            <span className="print:hidden"><OrderStatusBadge status={order.orderStatus} /></span>
            <span className="hidden print:inline font-semibold">{ORDER_STATUS_LABELS[order.orderStatus]}</span>
          </dd>
        </div>
      </dl>

      <p className="mx-6 my-6 text-center text-xs text-slate-ink">
        Show this Order ID at the counter and pay when you collect. Thank you — Tashi Delek!
      </p>
    </article>
  );
}

function Row({ label, value }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-slate-ink">{label}</dt>
      <dd className="font-semibold text-espresso">{value}</dd>
    </div>
  );
}
