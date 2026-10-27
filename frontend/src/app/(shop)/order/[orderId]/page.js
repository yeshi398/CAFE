import Link from "next/link";
import { notFound } from "next/navigation";
import { backendGet } from "@/lib/backend";
import Receipt from "@/components/Receipt";
import ReceiptActions from "@/components/ReceiptActions";
import ReceiptTokenRecovery from "@/components/ReceiptTokenRecovery";
import { OrderStatusBadge, PaymentBadge, OrderTypeBadge } from "@/components/StatusBadge";
import { formatNu, formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { orderId } = await params;
  return { title: `Order ${orderId}`, robots: { index: false } };
}

export default async function OrderPage({ params, searchParams }) {
  const { orderId } = await params;
  const sp = await searchParams;
  const token = typeof sp?.t === "string" ? sp.t : null;
  const isNew = sp?.new === "1";

  const qs = token ? `?token=${encodeURIComponent(token)}` : "";
  const [result, cafe] = await Promise.all([
    backendGet(`/api/orders/${encodeURIComponent(orderId)}${qs}`),
    backendGet("/api/settings").catch(() => null),
  ]);
  if (!result) notFound();

  // Without the secret token we only show the order's status.
  if (result.access !== "full") {
    const o = result.order;
    return (
      <div className="mx-auto max-w-xl px-4 pt-10">
        {/* If this device placed the order, it has the token – reload with it. */}
        <ReceiptTokenRecovery orderId={o.orderId} />
        <div className="card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-ink">Order</p>
          <p className="font-mono text-2xl font-bold">{o.orderId}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <OrderStatusBadge status={o.orderStatus} />
            <PaymentBadge status={o.paymentStatus} />
            <OrderTypeBadge type={o.orderType} table={o.tableNumber} />
          </div>
          <p className="mt-4 text-sm text-slate-ink">
            {o.customerName} · {o.itemCount} item(s) · {formatNu(o.totalAmount)} · {formatDateTime(o.createdAt)}
          </p>
          <p className="mt-4 rounded-xl bg-crema/60 p-3 text-sm text-coffee">
            The full receipt can only be opened on the phone that placed the order (or from the receipt link). Show your
            Order ID at the counter.
          </p>
          <Link href={`/track-order?id=${o.orderId}`} className="btn-primary mt-5 w-full">Track this order</Link>
        </div>
      </div>
    );
  }

  const order = result.order;
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8">
      {isNew && (
        <div role="status" className="no-print mx-auto mb-6 max-w-xl rounded-2xl bg-sage px-5 py-4 text-white shadow-lg">
          <p className="font-display text-xl font-semibold">✓ Order placed successfully!</p>
          <p className="mt-1 text-white/95 leading-relaxed">
            Your order has been placed successfully! Please show your Order ID or receipt at the CST Café counter and pay
            the amount shown when collecting your order.
          </p>
        </div>
      )}
      <Receipt order={order} cafe={cafe} />
      <ReceiptActions orderId={order.orderId} />
      <p className="no-print mt-6 text-center text-sm text-slate-ink">
        Tip: bookmark this page or take a screenshot. Your recent orders are also listed on{" "}
        <Link href="/track-order" className="font-semibold text-ember hover:underline">Track Order</Link>.
      </p>
    </div>
  );
}
