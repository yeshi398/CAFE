"use client";

import { LIMITS } from "@/lib/constants";

export default function QtyStepper({ value, onChange, min = 1, max = LIMITS.MAX_QTY_PER_ITEM, size = "md", label = "Quantity" }) {
  const btn = size === "sm" ? "h-9 w-9 text-lg" : "h-11 w-11 text-xl";
  return (
    <div className="inline-flex items-center rounded-full border-2 border-coffee/15 bg-white" role="group" aria-label={label}>
      <button
        type="button"
        className={`${btn} grid place-items-center rounded-full font-bold text-coffee hover:bg-coffee/5 disabled:opacity-30`}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="min-w-8 text-center font-bold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={`${btn} grid place-items-center rounded-full font-bold text-coffee hover:bg-coffee/5 disabled:opacity-30`}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
