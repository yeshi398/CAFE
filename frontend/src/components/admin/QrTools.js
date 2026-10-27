"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** Makes a large (1024 px) PNG of the QR code in the browser and downloads it. */
async function downloadPng(url, filename) {
  const dataUrl = await QRCode.toDataURL(url, {
    width: 1024, // sharp enough for posters
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#3b2416", light: "#ffffff" },
  });
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function QrTools({ siteUrl, menuLink, preview, tableCount, cafeName }) {
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(Math.min(tableCount || 10, 12));
  const [cards, setCards] = useState([]);
  const [copied, setCopied] = useState(false);

  // Table cards are generated in the browser for the print preview.
  useEffect(() => {
    let cancelled = false;
    const a = Math.max(1, Number(from) || 1);
    const b = Math.min(200, Math.max(a, Number(to) || a));
    Promise.all(
      Array.from({ length: b - a + 1 }, (_, i) => a + i).map(async (t) => ({
        table: t,
        url: `${siteUrl}/menu?table=${t}`,
        img: await QRCode.toDataURL(`${siteUrl}/menu?table=${t}`, { width: 300, margin: 1, color: { dark: "#3b2416", light: "#ffffff" } }),
      }))
    ).then((c) => !cancelled && setCards(c));
    return () => {
      cancelled = true;
    };
  }, [from, to, siteUrl]);

  return (
    <>
      {/* Main QR */}
      <section className="no-print mt-6 grid gap-6 md:grid-cols-[auto_1fr] items-center card p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt={`QR code for ${menuLink}`} width={240} height={240} className="rounded-xl border border-coffee/10 bg-white p-2" />
        <div>
          <h2 className="text-2xl font-semibold">Main menu QR</h2>
          <p className="mt-1 break-all font-mono text-sm text-slate-ink">{menuLink}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-primary btn-sm min-h-11" onClick={() => downloadPng(menuLink, "cst-cafe-menu-qr.png")}>
              ⬇ Download PNG (1024 px)
            </button>
            <button
              className="btn-ghost btn-sm min-h-11"
              onClick={async () => {
                await navigator.clipboard?.writeText(menuLink);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? "✓ Copied" : "Copy link"}
            </button>
            <a href={menuLink} target="_blank" rel="noreferrer" className="btn-ghost btn-sm min-h-11">Open ↗</a>
          </div>
          <p className="mt-3 text-sm text-slate-ink">Print it on posters, the counter or the notice board. The 1024 px PNG stays sharp up to A4 size.</p>
        </div>
      </section>

      {/* Table QRs */}
      <section className="mt-6 card p-6 no-print">
        <h2 className="text-2xl font-semibold">Table QR cards</h2>
        <p className="mt-1 text-sm text-slate-ink">
          Each code opens the menu with <strong>Dine-in</strong> and the table number already selected (<code>/menu?table=5</code>).
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label>
            <span className="label">From table</span>
            <input type="number" min="1" max="200" className="field w-28" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label>
            <span className="label">To table</span>
            <input type="number" min="1" max="200" className="field w-28" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
          <button className="btn-accent" onClick={() => window.print()}>🖨 Print table cards</button>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 print:grid-cols-2 print:gap-6">
        {cards.map((c) => (
          <div key={c.table} className="card break-inside-avoid p-4 text-center print:border-2 print:border-coffee print:shadow-none">
            <p className="font-display text-lg font-semibold text-coffee">{cafeName}</p>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-ink">Scan to order</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.img} alt={`QR for table ${c.table}`} className="mx-auto my-2 w-40" />
            <p className="font-display text-3xl font-bold text-ember">Table {c.table}</p>
            <p className="mt-1 text-[11px] text-slate-ink">Pay at the counter when you collect</p>
            <button
              onClick={() => downloadPng(c.url, `cst-cafe-table-${c.table}-qr.png`)}
              className="no-print mt-2 inline-block text-xs font-semibold text-ember hover:underline"
            >
              Download PNG
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
