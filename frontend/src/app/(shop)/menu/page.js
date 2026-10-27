import { backendGet } from "@/lib/backend";
import MenuBrowser from "@/components/MenuBrowser";

export const dynamic = "force-dynamic";
export const metadata = { title: "Menu" };

export default async function MenuPage({ searchParams }) {
  const sp = await searchParams;
  // Table-specific QR codes open /menu?table=7 → pre-select dine-in at table 7.
  const t = parseInt(sp?.table, 10);
  const table = Number.isInteger(t) && t >= 1 && t <= 200 ? t : null;

  let menu = null;
  let settings = null;
  try {
    [menu, settings] = await Promise.all([backendGet("/api/menu"), backendGet("/api/settings")]);
  } catch (err) {
    console.error("[menu] load failed:", err.message);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8">
      <h1 className="text-4xl font-semibold">Our menu</h1>
      <p className="mt-1 text-slate-ink">All prices in Bhutanese Ngultrum (Nu.). Pay in cash at the counter when you collect.</p>
      {settings && !settings.acceptingOrders && (
        <p className="mt-4 rounded-xl bg-chili-soft px-4 py-3 font-semibold text-chili">
          Online ordering is paused right now. You can still browse the menu.
        </p>
      )}
      {menu ? (
        <MenuBrowser categories={menu.categories} items={menu.items} table={table} />
      ) : (
        <div className="card mt-8 p-8 text-center">
          <p className="font-semibold text-coffee">We couldn&apos;t load the menu right now.</p>
          <p className="mt-1 text-slate-ink">Please refresh the page in a moment.</p>
        </div>
      )}
    </div>
  );
}
