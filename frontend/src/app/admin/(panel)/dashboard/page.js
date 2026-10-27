import Link from "next/link";
import { backendGet } from "@/lib/backend";
import { formatNu, formatTime } from "@/lib/format";
import { OrderStatusBadge, PaymentBadge, OrderTypeBadge } from "@/components/StatusBadge";
import AutoRefresh from "@/components/admin/AutoRefresh";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default async function DashboardPage() {
  const [s, active] = await Promise.all([
    backendGet("/api/admin/summary", { auth: true }),
    backendGet("/api/admin/orders?view=active&sort=oldest", { auth: true }),
  ]);
  const activeOrders = active.orders.slice(0, 8);
  const maxDaily = Math.max(1, ...s.daily.map((d) => d.sales));
  const maxMonthly = Math.max(1, ...s.monthly.map((m) => m.sales));
  const typeTotal = s.orderTypes.TAKEAWAY + s.orderTypes.DINE_IN || 1;

  return (
    <div className="mx-auto max-w-6xl">
      <AutoRefresh seconds={30} />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-sm text-slate-ink">Sales count only orders that are <strong>paid and completed</strong>. Updates every 30 s.</p>
        </div>
        <Link href="/admin/orders?view=active" className="btn-accent btn-sm min-h-10">Open live orders →</Link>
      </div>

      {/* Money */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Sales">
        <Stat label="Today's sales" value={formatNu(s.today.sales)} hint={`${s.today.count} paid & completed`} tone="ember" />
        <Stat label="This month" value={formatNu(s.month.sales)} hint={`${s.month.count} paid & completed`} />
        <Stat label="Total sales (all time)" value={formatNu(s.revenue.total)} hint={`${s.revenue.count} completed orders`} />
        <Stat
          label="Unpaid – awaiting payment"
          value={formatNu(s.unpaid.total)}
          hint={`${s.unpaid.count} open order(s) · not counted as sales`}
          tone="chili"
        />
      </section>

      {/* Counts */}
      <section className="mt-4 grid gap-4 grid-cols-2 lg:grid-cols-4" aria-label="Orders">
        <MiniStat label="Orders today" value={s.todayOrders} />
        <MiniStat label="Confirmed orders (all time)" value={s.totalOrders} hint="excludes cancelled" />
        <MiniStat label="Paid, not yet collected" value={s.paidNotCollected.count} hint={formatNu(s.paidNotCollected.total)} />
        <MiniStat label="Cancelled" value={s.cancelledCount} hint="never counted as sales" />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Daily chart */}
        <section className="card p-5">
          <h2 className="text-xl font-semibold">Daily sales · last 14 days</h2>
          <div className="mt-5 flex h-48 items-end gap-1.5" role="img" aria-label="Bar chart of daily sales for the last 14 days">
            {s.daily.map((d) => {
              const h = Math.round((d.sales / maxDaily) * 100);
              return (
                <div key={d.date} className="group flex flex-1 flex-col items-center justify-end h-full">
                  <span className="mb-1 text-[10px] font-semibold text-coffee opacity-0 group-hover:opacity-100">{d.sales ? Math.round(d.sales) : ""}</span>
                  <div
                    className="w-full rounded-t-md bg-ember/85 group-hover:bg-ember"
                    style={{ height: `${Math.max(d.sales ? 4 : 1, h)}%` }}
                    title={`${d.date}: ${formatNu(d.sales)} · ${d.orders} orders`}
                  />
                  <span className="mt-1 text-[10px] text-slate-ink">{Number(d.date.slice(8))}</span>
                </div>
              );
            })}
          </div>
          <h3 className="mt-8 font-sans text-sm font-bold uppercase tracking-wider text-slate-ink">Monthly · last 12 months</h3>
          <table className="mt-2 w-full text-sm">
            <tbody>
              {s.monthly.slice().reverse().slice(0, 6).map((m) => (
                <tr key={m.month} className="border-b border-coffee/5">
                  <td className="py-1.5 w-20 text-slate-ink">{MONTHS[Number(m.month.slice(5)) - 1]} {m.month.slice(0, 4)}</td>
                  <td className="py-1.5">
                    <div className="h-2.5 rounded-full bg-coffee/70" style={{ width: `${Math.max(1, (m.sales / maxMonthly) * 100)}%` }} />
                  </td>
                  <td className="py-1.5 w-28 text-right font-semibold tabular-nums">{formatNu(m.sales)}</td>
                  <td className="py-1.5 w-16 text-right text-slate-ink tabular-nums">{m.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="space-y-6">
          {/* Popular items */}
          <section className="card p-5">
            <h2 className="text-xl font-semibold">Popular items</h2>
            {s.popular.length === 0 ? (
              <p className="mt-3 text-sm text-slate-ink">No orders yet.</p>
            ) : (
              <ol className="mt-3 space-y-2">
                {s.popular.map((p, i) => (
                  <li key={p.id} className="flex items-center gap-3 text-sm">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-crema font-bold text-coffee">{i + 1}</span>
                    <span className="flex-1 font-semibold">{p.name}</span>
                    <span className="tabular-nums text-slate-ink">{p.quantity} sold</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* Type split */}
          <section className="card p-5">
            <h2 className="text-xl font-semibold">Takeaway vs dine-in</h2>
            <div className="mt-4 flex h-4 overflow-hidden rounded-full bg-crema">
              <div className="bg-ember" style={{ width: `${(s.orderTypes.TAKEAWAY / typeTotal) * 100}%` }} />
              <div className="bg-coffee" style={{ width: `${(s.orderTypes.DINE_IN / typeTotal) * 100}%` }} />
            </div>
            <div className="mt-3 flex justify-between text-sm">
              <span><span className="inline-block h-3 w-3 rounded-full bg-ember align-middle" /> Takeaway <strong>{s.orderTypes.TAKEAWAY}</strong></span>
              <span><span className="inline-block h-3 w-3 rounded-full bg-coffee align-middle" /> Dine-in <strong>{s.orderTypes.DINE_IN}</strong></span>
            </div>
          </section>
        </div>
      </div>

      {/* Active orders */}
      <section className="card mt-6 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">In progress (oldest first)</h2>
          <Link href="/admin/orders?view=active" className="text-sm font-semibold text-ember hover:underline">Manage →</Link>
        </div>
        {activeOrders.length === 0 ? (
          <p className="mt-3 text-sm text-slate-ink">No open orders. 🎉</p>
        ) : (
          <ul className="mt-3 divide-y divide-coffee/10">
            {activeOrders.map((o) => (
              <li key={o.orderId} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-sm">
                <Link href={`/admin/orders/${o.orderId}`} className="font-mono font-bold hover:text-ember">{o.orderId}</Link>
                <span className="text-slate-ink">{formatTime(o.createdAt)}</span>
                <span className="font-semibold">{o.customerName}</span>
                <OrderTypeBadge type={o.orderType} table={o.tableNumber} />
                <span className="ml-auto flex items-center gap-2">
                  <OrderStatusBadge status={o.orderStatus} />
                  <PaymentBadge status={o.paymentStatus} />
                  <strong className="tabular-nums">{formatNu(o.totalAmount)}</strong>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, hint, tone }) {
  const color = tone === "ember" ? "text-ember" : tone === "chili" ? "text-chili" : "text-coffee";
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-ink">{label}</p>
      <p className={`mt-1 font-display text-3xl font-semibold tabular-nums ${color}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-ink">{hint}</p>
    </div>
  );
}

function MiniStat({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-coffee/10 bg-foam/60 px-4 py-3">
      <p className="text-xs text-slate-ink">{label}</p>
      <p className="text-2xl font-bold tabular-nums text-coffee">{value}</p>
      {hint && <p className="text-xs text-slate-ink">{hint}</p>}
    </div>
  );
}
