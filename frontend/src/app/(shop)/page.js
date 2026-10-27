import Link from "next/link";
import QRCode from "qrcode";
import { backendGet } from "@/lib/backend";
import { getSiteUrl, menuUrl } from "@/lib/site";
import MenuItemCard from "@/components/MenuItemCard";
import Logo from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let menu = { categories: [], items: [] };
  let settings = null;
  try {
    [menu, settings] = await Promise.all([backendGet("/api/menu"), backendGet("/api/settings")]);
  } catch (err) {
    console.error("[home] could not load data:", err.message);
  }

  const iconFor = Object.fromEntries(menu.categories.map((c) => [c.id, c.icon]));
  const drinkCats = new Set(menu.categories.filter((c) => /beverage|drink/i.test(c.name)).map((c) => c.id));
  const available = menu.items.filter((i) => i.isAvailable);
  const featuredFood = available.filter((i) => i.isFeatured && !drinkCats.has(i.categoryId)).slice(0, 6);
  const featuredDrinks = available.filter((i) => drinkCats.has(i.categoryId)).sort((a, b) => b.isFeatured - a.isFeatured).slice(0, 4);

  const url = menuUrl(await getSiteUrl());
  const qr = await QRCode.toDataURL(url, { width: 360, margin: 1, color: { dark: "#3b2416", light: "#fffaf3" } });

  return (
    <>
      {/* ── Hero ───────────────────────────── */}
      <section className="relative overflow-hidden bg-coffee text-foam">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #e9a43c 0 2px, transparent 3px), radial-gradient(circle at 70% 60%, #fffaf3 0 1.5px, transparent 2.5px)",
            backgroundSize: "38px 38px, 52px 52px",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:py-20 grid gap-10 md:grid-cols-[1.3fr_1fr] items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-saffron">
              Kuzuzangpo la · Welcome
            </p>
            <h1 className="mt-5 text-4xl sm:text-6xl font-semibold text-foam leading-[1.05]">
              Skip the queue.
              <br />
              <span className="text-saffron">Order ahead</span> at CST Café.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-crema/90 leading-relaxed">
              Hot momos between lectures, suja before the lab, ema datshi after a long day — pick your food,
              place your order, and pay at the counter when you collect it.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/menu" className="btn-accent text-lg px-7">
                View Menu →
              </Link>
              <Link href="/track-order" className="btn border-2 border-foam/30 text-foam hover:bg-white/10">
                Track my order
              </Link>
            </div>
            {settings && !settings.acceptingOrders && (
              <p className="mt-6 inline-block rounded-xl bg-chili px-4 py-2 font-semibold">
                Online ordering is paused right now — please order at the counter.
              </p>
            )}
          </div>

          <div className="relative hidden md:block">
            <div className="mx-auto aspect-square max-w-sm rounded-full bg-gradient-to-br from-ember to-saffron p-3 shadow-2xl">
              <div className="grid h-full w-full place-items-center rounded-full bg-coffee-light/40 border-4 border-dashed border-foam/30">
                <Logo size={200} />
              </div>
            </div>
            <div className="absolute -bottom-2 left-2 card px-4 py-3 text-espresso rotate-[-4deg]">
              <p className="text-xs uppercase tracking-wider text-slate-ink">No account needed</p>
              <p className="font-display text-lg font-semibold text-coffee">Order now, pay at the counter</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────── */}
      <section className="mx-auto max-w-6xl px-4 -mt-6 relative z-10">
        <ol className="grid gap-3 sm:grid-cols-4">
          {[
            ["1", "Browse", "Open the menu on your phone"],
            ["2", "Order", "Add items and confirm"],
            ["3", "Get your ID", "e.g. CST-20261020-001"],
            ["4", "Pay & collect", "Cash at the counter"],
          ].map(([n, t, d]) => (
            <li key={n} className="card flex items-center gap-3 p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ember-soft font-display text-lg font-bold text-ember">
                {n}
              </span>
              <span>
                <span className="block font-bold text-coffee">{t}</span>
                <span className="block text-sm text-slate-ink">{d}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Featured food ──────────────────── */}
      {featuredFood.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 mt-16">
          <SectionHead title="Campus favourites" subtitle="What CST students order most" />
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredFood.map((item) => (
              <MenuItemCard key={item.id} item={item} icon={iconFor[item.categoryId]} />
            ))}
          </div>
        </section>
      )}

      {/* ── Drinks ─────────────────────────── */}
      {featuredDrinks.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 mt-16">
          <SectionHead title="Popular drinks" subtitle="From butter tea to cold coffee" />
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredDrinks.map((item) => (
              <MenuItemCard key={item.id} item={item} icon={iconFor[item.categoryId]} compact />
            ))}
          </div>
        </section>
      )}

      {menu.items.length === 0 && (
        <section className="mx-auto max-w-6xl px-4 mt-16">
          <div className="card p-8 text-center text-slate-ink">
            The menu is being updated. Please check back shortly.
          </div>
        </section>
      )}

      {/* ── Info + QR ──────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 mt-16 grid gap-5 md:grid-cols-3">
        <div className="card p-6">
          <h2 className="text-2xl font-semibold">Opening hours</h2>
          <p className="mt-3 whitespace-pre-line text-slate-ink leading-relaxed">
            {settings?.openingHours || "See the notice at the café"}
          </p>
        </div>
        <div className="card p-6">
          <h2 className="text-2xl font-semibold">Where to find us</h2>
          <p className="mt-3 text-slate-ink leading-relaxed">{settings?.location || "College of Science and Technology"}</p>
          {settings?.phone && <p className="mt-2 font-semibold text-coffee">{settings.phone}</p>}
        </div>
        <div className="card p-6 flex items-center gap-5 bg-ember-soft/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR code that opens the CST Café menu" width={120} height={120} className="rounded-lg bg-foam p-1.5" />
          <div>
            <h2 className="text-2xl font-semibold">Scan QR to order</h2>
            <p className="mt-2 text-sm text-slate-ink">
              Point your phone camera at the code — no app needed. You&apos;ll also find it on every café table.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHead({ title, subtitle }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-3xl font-semibold">{title}</h2>
        <p className="mt-1 text-slate-ink">{subtitle}</p>
      </div>
      <Link href="/menu" className="shrink-0 font-semibold text-ember hover:underline">
        Full menu →
      </Link>
    </div>
  );
}
