"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { useCafeData } from "@/components/useCafeData";
import OrderSummary from "@/components/OrderSummary";
import { formatNu, round2 } from "@/lib/format";
import { totalsFor } from "@/lib/pricing";
import { LIMITS } from "@/lib/constants";
import { rememberOrder, randomKey } from "@/lib/myOrders";

const DETAILS_KEY = "cst-cafe-customer"; // remember name/phone for next time

export default function CheckoutPage() {
  const router = useRouter();
  const { ready, items, orderType, setOrderType, tableNumber, setTableNumber, clearCart } = useCart();
  const { settings } = useCafeData();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);
  // One key per checkout attempt: a double-click or network retry reuses it,
  // and the server returns the same order instead of creating a duplicate.
  const idemKey = useRef(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(DETAILS_KEY) || "null");
      if (saved?.name) setName(saved.name);
      if (saved?.phone) setPhone(saved.phone);
    } catch {}
  }, []);

  // If the cart changes, it's a different order → new key.
  const cartSignature = items.map((i) => `${i.id}x${i.quantity}`).join(",") + orderType + tableNumber;
  useEffect(() => {
    idemKey.current = randomKey();
  }, [cartSignature]);

  if (!ready) return <Shell><p className="mt-8 text-slate-ink">Loading…</p></Shell>;

  if (items.length === 0 && !placed) {
    return (
      <Shell>
        <div className="card mt-8 p-10 text-center">
          <h2 className="text-2xl font-semibold">Nothing to check out</h2>
          <p className="mt-1 text-slate-ink">Your cart is empty.</p>
          <Link href="/menu" className="btn-primary mt-6">Go to the menu</Link>
        </div>
      </Shell>
    );
  }

  const blocked = items.filter((i) => i.unavailable);
  const subtotal = round2(items.reduce((s, i) => s + i.price * i.quantity, 0));
  const { charges, total } = totalsFor(subtotal, orderType, settings);
  const maxTable = settings?.tableCount || 200;

  function validate() {
    const e = {};
    if (name.trim().length < 2) e.customerName = "Please enter your name (at least 2 letters)";
    if (phone.trim() && !/^\+?[0-9][0-9\s-]{6,14}$/.test(phone.trim())) e.customerPhone = "Enter a valid phone number or leave it empty";
    if (orderType === "DINE_IN") {
      const t = Number(tableNumber);
      if (!Number.isInteger(t) || t < 1 || t > maxTable) e.tableNumber = `Enter a table number from 1 to ${maxTable}`;
    }
    return e;
  }

  async function submit(ev) {
    ev.preventDefault();
    if (submitting) return;
    setFormError("");
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    if (blocked.length) {
      setFormError("Some items are unavailable. Please go back to your cart and remove them.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          customerPhone: phone.trim(),
          orderType,
          tableNumber: orderType === "DINE_IN" ? Number(tableNumber) : null,
          specialInstructions: notes.trim(),
          // Only ids and quantities – the server looks up the real prices.
          items: items.map((i) => ({ menuItemId: i.id, quantity: i.quantity })),
          idempotencyKey: idemKey.current,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(data.fields || {});
        setFormError(data.error || "Could not place your order. Please try again.");
        setSubmitting(false);
        return;
      }
      // Saved in the database ✔ – now show the receipt.
      try {
        localStorage.setItem(DETAILS_KEY, JSON.stringify({ name: name.trim(), phone: phone.trim() }));
      } catch {}
      rememberOrder({ orderId: data.orderId, token: data.accessToken, totalAmount: data.totalAmount });
      setPlaced(true);
      clearCart();
      router.replace(`/order/${data.orderId}?t=${encodeURIComponent(data.accessToken)}&new=1`);
    } catch {
      setFormError("Network problem – your order may not have been sent. Check your connection and press Confirm again (you won't be charged twice).");
      setSubmitting(false);
    }
  }

  if (placed) {
    return (
      <Shell>
        <div className="card mt-8 p-10 text-center">
          <Spinner /> <p className="mt-3 font-semibold text-coffee">Order placed! Opening your receipt…</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <form onSubmit={submit} noValidate className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px] items-start">
        <div className="space-y-6">
          {/* Your details */}
          <fieldset className="card p-5 sm:p-6">
            <legend className="sr-only">Your details</legend>
            <h2 className="text-xl font-semibold">Your details</h2>
            <p className="text-sm text-slate-ink">No account needed. We call your name when it&apos;s ready.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Name *" error={errors.customerName}>
                <input
                  className="field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={LIMITS.NAME_MAX}
                  autoComplete="name"
                  placeholder="e.g. Karma Dorji"
                  aria-invalid={!!errors.customerName}
                />
              </Field>
              <Field label="Phone (optional)" error={errors.customerPhone}>
                <input
                  className="field"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="17XXXXXX"
                  maxLength={16}
                  aria-invalid={!!errors.customerPhone}
                />
              </Field>
            </div>
          </fieldset>

          {/* Order type */}
          <fieldset className="card p-5 sm:p-6">
            <legend className="sr-only">Order type</legend>
            <h2 className="text-xl font-semibold">How would you like it?</h2>
            <div className="mt-4 grid grid-cols-2 gap-3" role="radiogroup">
              {[
                ["TAKEAWAY", "🥡", "Takeaway", "Collect at the counter"],
                ["DINE_IN", "🍽", "Dine-in", "Eat at a café table"],
              ].map(([value, icon, label, hint]) => (
                <label
                  key={value}
                  className={`cursor-pointer rounded-2xl border-2 p-4 transition ${
                    orderType === value ? "border-ember bg-ember-soft/50" : "border-coffee/10 bg-white hover:border-coffee/30"
                  }`}
                >
                  <input type="radio" name="orderType" value={value} checked={orderType === value} onChange={() => setOrderType(value)} className="sr-only" />
                  <span className="text-2xl" aria-hidden="true">{icon}</span>
                  <span className="block mt-1 font-bold text-coffee">{label}</span>
                  <span className="block text-sm text-slate-ink">{hint}</span>
                </label>
              ))}
            </div>
            {orderType === "DINE_IN" && (
              <div className="mt-4 max-w-xs">
                <Field label="Table number *" error={errors.tableNumber}>
                  {settings?.tableCount > 0 && settings.tableCount <= 60 ? (
                    <select className="field" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} aria-invalid={!!errors.tableNumber}>
                      <option value="">Select your table</option>
                      {Array.from({ length: settings.tableCount }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>Table {n}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="field"
                      inputMode="numeric"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value.replace(/\D/g, ""))}
                      placeholder="Number on your table"
                      aria-invalid={!!errors.tableNumber}
                    />
                  )}
                </Field>
              </div>
            )}
          </fieldset>

          {/* Notes */}
          <fieldset className="card p-5 sm:p-6">
            <legend className="sr-only">Special instructions</legend>
            <Field label="Special instructions (optional)" error={errors.specialInstructions}>
              <textarea
                className="field min-h-24 py-3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={LIMITS.INSTRUCTIONS_MAX}
                placeholder="Less chilli, no onion, extra ezay…"
              />
            </Field>
            <p className="mt-1 text-right text-xs text-slate-ink">{notes.length}/{LIMITS.INSTRUCTIONS_MAX}</p>
          </fieldset>
        </div>

        {/* Summary */}
        <aside className="card p-5 sm:p-6 lg:sticky lg:top-24">
          <h2 className="text-xl font-semibold">Order summary</h2>
          <ul className="mt-4 space-y-2 text-[15px]">
            {items.map((i) => (
              <li key={i.id} className={`flex justify-between gap-3 ${i.unavailable ? "text-chili line-through" : ""}`}>
                <span>
                  <span className="font-bold tabular-nums">{i.quantity}×</span> {i.name}
                </span>
                <span className="tabular-nums">{formatNu(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-coffee/10 pt-4">
            <OrderSummary subtotal={subtotal} charges={charges} total={total} />
          </div>
          <p className="mt-4 rounded-xl bg-crema/60 p-3 text-sm text-coffee">
            💵 <strong>Payment:</strong> cash at the CST Café counter when you collect your order.
          </p>

          {formError && (
            <p role="alert" className="mt-4 rounded-xl bg-chili-soft px-4 py-3 text-sm font-semibold text-chili">
              {formError}
            </p>
          )}

          <button type="submit" className="btn-accent mt-5 w-full text-lg" disabled={submitting || (settings && !settings.acceptingOrders)}>
            {submitting ? (<><Spinner light /> Placing order…</>) : `Confirm Order · ${formatNu(total)}`}
          </button>
          {settings && !settings.acceptingOrders && (
            <p className="mt-2 text-center text-sm font-semibold text-chili">Online ordering is paused right now.</p>
          )}
          <Link href="/cart" className="mt-3 block text-center text-sm font-semibold text-ember hover:underline">← Back to cart</Link>
        </aside>
      </form>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8">
      <h1 className="text-4xl font-semibold">Checkout</h1>
      {children}
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {error && <span className="mt-1 block text-sm font-semibold text-chili">{error}</span>}
    </label>
  );
}

function Spinner({ light }) {
  return (
    <span
      className={`inline-block h-5 w-5 animate-spin rounded-full border-[3px] ${light ? "border-white/40 border-t-white" : "border-coffee/20 border-t-coffee"}`}
      aria-hidden="true"
    />
  );
}
