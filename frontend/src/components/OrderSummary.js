import { formatNu } from "@/lib/format";

/** Subtotal / charges / total block, shared by cart and checkout. */
export default function OrderSummary({ subtotal, charges = [], total, note }) {
  return (
    <dl className="space-y-2 text-[15px]">
      <div className="flex justify-between">
        <dt className="text-slate-ink">Subtotal</dt>
        <dd className="font-semibold tabular-nums">{formatNu(subtotal)}</dd>
      </div>
      {charges.map((c) => (
        <div key={c.label} className="flex justify-between">
          <dt className="text-slate-ink">{c.label}</dt>
          <dd className="font-semibold tabular-nums">{formatNu(c.amount)}</dd>
        </div>
      ))}
      <div className="flex justify-between border-t-2 border-dashed border-coffee/15 pt-3 mt-3">
        <dt className="font-display text-xl font-semibold text-coffee">Total payable</dt>
        <dd className="font-display text-2xl font-semibold text-ember tabular-nums">{formatNu(total)}</dd>
      </div>
      {note && <p className="pt-1 text-xs text-slate-ink">{note}</p>}
    </dl>
  );
}
