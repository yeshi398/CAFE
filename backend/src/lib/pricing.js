import { round2 } from "./format.js";

/**
 * Extra charges for an order type. Used by the server when billing AND by
 * the cart/checkout to show the same numbers – one source of truth.
 */
export function chargesFor(orderType, settings) {
  const charges = [];
  if (orderType === "TAKEAWAY" && Number(settings?.takeawayCharge) > 0) {
    charges.push({ label: settings.takeawayChargeLabel || "Takeaway packaging", amount: Number(settings.takeawayCharge) });
  }
  return charges;
}

export function totalsFor(subtotal, orderType, settings) {
  const charges = chargesFor(orderType, settings);
  const extra = round2(charges.reduce((s, c) => s + c.amount, 0));
  return { charges, additionalCharges: extra, total: round2(subtotal + extra) };
}
