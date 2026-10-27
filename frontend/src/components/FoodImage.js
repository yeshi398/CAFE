"use client";

import { useState } from "react";

const TINTS = [
  ["#f6dcc3", "#e9b98c"],
  ["#ead9c3", "#c9a682"],
  ["#f3e3c8", "#e9a43c"],
  ["#e8d6cb", "#b98b6e"],
  ["#dcebd5", "#a8c49c"],
];

/**
 * Shows the item photo. If there is no photo (or it fails to load) shows a
 * warm illustrated tile with the category icon instead of a broken image.
 */
export default function FoodImage({ src, alt, icon = "🍽️", className = "", seed = "" }) {
  const [failed, setFailed] = useState(false);
  const show = src && !failed;
  const n = [...String(seed || alt)].reduce((s, c) => s + c.charCodeAt(0), 0);
  const [a, b] = TINTS[n % TINTS.length];

  if (show) {
    return (
      // Plain <img> so the owner can use any image URL without extra config.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />
    );
  }
  return (
    <div
      role="img"
      aria-label={alt}
      className={`grid place-items-center ${className}`}
      style={{ background: `radial-gradient(circle at 30% 25%, ${a}, ${b})` }}
    >
      <span className="text-5xl drop-shadow-sm" aria-hidden="true">{icon}</span>
    </div>
  );
}
