"use client";

import { useState } from "react";
import FoodImage from "./FoodImage";
import QtyStepper from "./QtyStepper";
import { useCart } from "./CartProvider";
import { formatNu } from "@/lib/format";

export default function MenuItemCard({ item, icon, compact = false }) {
  const { addItem, items } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const inCart = items.find((i) => i.id === item.id)?.quantity || 0;

  function add() {
    addItem(item, qty);
    setAdded(true);
    setQty(1);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <article className={`card overflow-hidden flex flex-col ${!item.isAvailable ? "opacity-75" : ""}`}>
      <div className="relative">
        <FoodImage src={item.image} alt={item.name} icon={icon} seed={item.id} className={`w-full ${compact ? "h-36" : "h-44"}`} />
        {!item.isAvailable && (
          <span className="absolute left-3 top-3 chip bg-chili text-white shadow">Sold out</span>
        )}
        {item.isAvailable && item.isFeatured && (
          <span className="absolute left-3 top-3 chip bg-saffron text-espresso shadow">★ Popular</span>
        )}
        {inCart > 0 && (
          <span className="absolute right-3 top-3 chip bg-coffee text-foam shadow">{inCart} in cart</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-sans text-base font-bold text-espresso leading-snug">{item.name}</h3>
          <p className="shrink-0 font-display text-lg font-semibold text-ember">{formatNu(item.price)}</p>
        </div>
        {item.description && <p className="mt-1 text-sm text-slate-ink leading-relaxed">{item.description}</p>}
        <div className="mt-auto pt-4">
          {item.isAvailable ? (
            <div className="flex items-center gap-2">
              <QtyStepper value={qty} onChange={setQty} size="sm" label={`Quantity of ${item.name}`} />
              <button
                type="button"
                onClick={add}
                className={`${added ? "btn-success" : "btn-primary"} btn-sm flex-1`}
                aria-live="polite"
              >
                {added ? "✓ Added" : "Add to cart"}
              </button>
            </div>
          ) : (
            <p className="text-sm font-semibold text-chili">Currently unavailable</p>
          )}
        </div>
      </div>
    </article>
  );
}
