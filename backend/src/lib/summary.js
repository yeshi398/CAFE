import { connectDB } from "./db.js";
import { bhutanDateKey, bhutanDayStart, round2 } from "./format.js";
import Order from "../models/Order.js";

/**
 * Sales summary for the admin dashboard.
 *
 * Definitions (kept deliberately strict):
 *  • Revenue / "Sales"  = orders that are PAID **and** COMPLETED.
 *  • Paid, not collected = PAID but still Received/Preparing/Ready.
 *  • Unpaid (open)      = UNPAID and not cancelled – money still expected.
 *  • Cancelled orders never count toward sales or order totals.
 * Daily/monthly figures use the date the payment was recorded (Bhutan time).
 */
export async function getSalesSummary() {
  await connectDB();

  const todayKey = bhutanDateKey();
  const todayStart = bhutanDayStart(todayKey);
  const monthStart = bhutanDayStart(`${todayKey.slice(0, 7)}-01`);
  const [ty, tm] = todayKey.split("-").map(Number);
  const firstMonth = new Date(Date.UTC(ty, tm - 1 - 11, 1));
  const yearAgo = bhutanDayStart(`${firstMonth.getUTCFullYear()}-${String(firstMonth.getUTCMonth() + 1).padStart(2, "0")}-01`);

  const REVENUE = { paymentStatus: "PAID", orderStatus: "COMPLETED" };
  const PAID_OPEN = { paymentStatus: "PAID", orderStatus: { $in: ["RECEIVED", "PREPARING", "READY"] } };
  const UNPAID = { paymentStatus: "UNPAID", orderStatus: { $ne: "CANCELLED" } };
  const sumOf = (match) => Order.aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]);

  const [
    totalOrders,
    cancelledCount,
    revenueAgg,
    paidOpenAgg,
    unpaidAgg,
    revenueCount,
    paidOpenCount,
    unpaidCount,
    typeAgg,
    statusAgg,
    todayOrders,
    recentSales,
    popularAgg,
  ] = await Promise.all([
    Order.countDocuments({ orderStatus: { $ne: "CANCELLED" } }),
    Order.countDocuments({ orderStatus: "CANCELLED" }),
    sumOf(REVENUE),
    sumOf(PAID_OPEN),
    sumOf(UNPAID),
    Order.countDocuments(REVENUE),
    Order.countDocuments(PAID_OPEN),
    Order.countDocuments(UNPAID),
    Order.aggregate([
      { $match: { orderStatus: { $ne: "CANCELLED" } } },
      { $group: { _id: "$orderType", count: { $sum: 1 } } },
    ]),
    Order.aggregate([{ $group: { _id: "$orderStatus", count: { $sum: 1 } } }]),
    Order.countDocuments({ createdAt: { $gte: todayStart }, orderStatus: { $ne: "CANCELLED" } }),
    Order.find(
      { paymentStatus: "PAID", orderStatus: "COMPLETED", paidAt: { $gte: yearAgo } },
      { totalAmount: 1, paidAt: 1 }
    ).lean(),
    Order.aggregate([
      { $match: { orderStatus: { $ne: "CANCELLED" } } },
      { $unwind: "$items" },
      // Group by item + name snapshot (an item renamed later appears twice here
      // and is merged below, keeping its most-ordered name).
      { $group: { _id: { id: "$items.menuItem", name: "$items.name" }, quantity: { $sum: "$items.quantity" }, revenue: { $sum: "$items.lineTotal" } } },
    ]),
  ]);

  // Daily (last 14 days) and monthly (last 12 months) buckets, Bhutan time.
  const daily = new Map();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(todayStart.getTime() - i * 86400000);
    daily.set(bhutanDateKey(d), { date: bhutanDateKey(d), sales: 0, orders: 0 });
  }
  const monthly = new Map();
  for (let i = 11; i >= 0; i--) {
    const [y, m] = todayKey.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1 - i, 1));
    const key = `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}`;
    monthly.set(key, { month: key, sales: 0, orders: 0 });
  }
  let todaySales = 0, todayPaidCount = 0, monthSales = 0, monthPaidCount = 0;
  for (const o of recentSales) {
    const dk = bhutanDateKey(o.paidAt);
    const mk = dk.slice(0, 7);
    if (daily.has(dk)) { daily.get(dk).sales += o.totalAmount; daily.get(dk).orders += 1; }
    if (monthly.has(mk)) { monthly.get(mk).sales += o.totalAmount; monthly.get(mk).orders += 1; }
    if (o.paidAt >= todayStart) { todaySales += o.totalAmount; todayPaidCount += 1; }
    if (o.paidAt >= monthStart) { monthSales += o.totalAmount; monthPaidCount += 1; }
  }

  const pick = (agg, count) => ({ total: round2(agg[0]?.total || 0), count });
  const byType = Object.fromEntries(typeAgg.map((t) => [t._id, t.count]));
  const byStatus = Object.fromEntries(statusAgg.map((s) => [s._id, s.count]));

  return {
    totalOrders,
    cancelledCount,
    todayOrders,
    revenue: pick(revenueAgg, revenueCount),
    paidNotCollected: pick(paidOpenAgg, paidOpenCount),
    unpaid: pick(unpaidAgg, unpaidCount),
    today: { sales: round2(todaySales), count: todayPaidCount },
    month: { sales: round2(monthSales), count: monthPaidCount },
    orderTypes: { TAKEAWAY: byType.TAKEAWAY || 0, DINE_IN: byType.DINE_IN || 0 },
    statusCounts: byStatus,
    daily: [...daily.values()].map((d) => ({ ...d, sales: round2(d.sales) })),
    monthly: [...monthly.values()].map((m) => ({ ...m, sales: round2(m.sales) })),
    popular: mergePopular(popularAgg),
  };
}

function mergePopular(rows) {
  const byId = new Map();
  for (const r of rows) {
    const id = String(r._id.id);
    const cur = byId.get(id) || { id, name: r._id.name, quantity: 0, revenue: 0, best: 0 };
    if (r.quantity > cur.best) {
      cur.name = r._id.name;
      cur.best = r.quantity;
    }
    cur.quantity += r.quantity;
    cur.revenue += r.revenue;
    byId.set(id, cur);
  }
  return [...byId.values()]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 8)
    .map(({ id, name, quantity, revenue }) => ({ id, name, quantity, revenue: round2(revenue) }));
}
