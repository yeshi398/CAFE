"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { useCafeData } from "@/components/useCafeData";
import FoodImage from "@/components/FoodImage";
import QtyStepper from "@/components/QtyStepper";
import OrderSummary from "@/components/OrderSummary";
import { formatNu, round2 } from "@/lib/format";
import { totalsFor } from "@/lib/pricing";

export default function CartPage() {
  const { ready, items, setQuantity, removeItem, clearCart, orderType } = useCart();
  const { settings, error } = useCafeData();

  if (!ready) return <PageShell><p className="mt-8 text-slate-ink">Loading your cart…</p></PageShell>;

  if (items.length === 0) {
    return (
      <PageShell>
        <div className="card mt-8 p-10 text-center">
          <p className="text-5xl" aria-hidden="true">🥡</p>
          <h2 className="mt-3 text-2xl font-semibold">Your cart is empty</h2>
          <p className="mt-1 text-slate-ink">Hungry? Add something tasty from the menu.</p>
          <Link href="/menu" className="btn-primary mt-6">Browse the menu</Link>
        </div>
      </PageShell>
    );
  }

  const orderable = items.filter((i) => !i.unavailable);
  const blocked = items.filter((i) => i.unavailable);
  const subtotal = round2(orderable.reduce((s, i) => s + i.price * i.quantity, 0));
  const { charges, total } = totalsFor(subtotal, orderType, settings);

  return (
    <PageShell>
      {error && <Alert>{error}</Alert>}
      {blocked.length > 0 && (
        <Alert tone="danger">
          {blocked.map((b) => b.name).join(", ")} {blocked.length > 1 ? "are" : "is"} not available right now. Please remove{" "}
          {blocked.length > 1 ? "them" : "it"} to continue.
        </Alert>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px] items-start">
        <ul className="card divide-y divide-coffee/10" aria-label="Items in your cart">
          {items.map((item) => (
            <li key={item.id} className={`flex gap-4 p-4 ${item.unavailable ? "bg-chili-soft/40" : ""}`}>
              <FoodImage src={item.image} alt={item.name} seed={item.id} className="h-20 w-20 shrink-0 rounded-xl" />
              <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-bold text-espresso">{item.name}</p>
                  <p className="text-sm text-slate-ink">{formatNu(item.price)} each</p>
                  {item.unavailable && <p className="text-sm font-semibold text-chili">Unavailable</p>}
                </div>
                <div className="flex items-center gap-3">
                  <QtyStepper
                    size="sm"
                    min={1}
                    value={item.quantity}
                    onChange={(q) => setQuantity(item.id, q)}
                    label={`Quantity of ${item.name}`}
                  />
                  <p className="w-24 text-right font-bold tabular-nums">{formatNu(item.price * item.quantity)}</p>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="h-9 w-9 grid place-items-center rounded-full text-chili hover:bg-chili-soft"
                    aria-label={`Remove ${item.name}`}
                    title="Remove"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
                    </svg>
                  </button>
                </div>
              </div>
            </li>
          ))}
          <li className="flex justify-between p-4">
            <Link href="/menu" className="font-semibold text-ember hover:underline">← Add more items</Link>
            <button type="button" onClick={() => confirm("Remove everything from your cart?") && clearCart()} className="text-sm font-semibold text-slate-ink hover:text-chili">
              Clear cart
            </button>
          </li>
        </ul>

        <aside className="card p-5 lg:sticky lg:top-24">
          <h2 className="text-xl font-semibold mb-4">Order summary</h2>
          <OrderSummary
            subtotal={subtotal}
            charges={charges}
            total={total}
            note={
              settings?.takeawayCharge > 0 && orderType !== "TAKEAWAY"
                ? `Takeaway orders add ${formatNu(settings.takeawayCharge)} for packaging.`
                : "Final amount is confirmed by the café when you place the order."
            }
          />
          {settings && !settings.acceptingOrders ? (
            <p className="mt-5 rounded-xl bg-chili-soft p-3 text-sm font-semibold text-chili">Online ordering is paused right now.</p>
          ) : (
            <Link
              href={blocked.length ? "#" : "/checkout"}
              aria-disabled={blocked.length > 0}
              className={`btn-accent mt-5 w-full text-lg ${blocked.length ? "pointer-events-none opacity-50" : ""}`}
            >
              Proceed to checkout
            </Link>
          )}
          <p className="mt-3 text-center text-xs text-slate-ink">💵 Pay in cash at the café counter</p>
        </aside>
      </div>
    </PageShell>
  );
}

function PageShell({ children }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8">
      <h1 className="text-4xl font-semibold">Your cart</h1>
      {children}
    </div>
  );
}

function Alert({ children, tone = "warn" }) {
  return (
    <p role="alert" className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold ${tone === "danger" ? "bg-chili-soft text-chili" : "bg-ember-soft text-ember"}`}>
      {children}
    </p>
  );
}
