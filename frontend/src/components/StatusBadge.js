import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, ORDER_TYPE_LABELS } from "@/lib/constants";

const ORDER_STYLES = {
  RECEIVED: "bg-ember-soft text-ember",
  PREPARING: "bg-saffron/25 text-[#7a4c07]",
  READY: "bg-sage text-white",
  COMPLETED: "bg-sage-soft text-sage",
  CANCELLED: "bg-chili-soft text-chili",
};

export function OrderStatusBadge({ status }) {
  return <span className={`chip ${ORDER_STYLES[status] || "bg-crema"}`}>{ORDER_STATUS_LABELS[status] || status}</span>;
}

export function PaymentBadge({ status }) {
  const paid = status === "PAID";
  return (
    <span className={`chip ${paid ? "bg-sage-soft text-sage" : "bg-chili-soft text-chili"}`}>
      {paid ? "✓ " : ""}
      {PAYMENT_STATUS_LABELS[status] || status}
    </span>
  );
}

export function OrderTypeBadge({ type, table }) {
  return (
    <span className="chip bg-crema text-coffee">
      {type === "DINE_IN" ? "🍽" : "🥡"} {ORDER_TYPE_LABELS[type]}
      {type === "DINE_IN" && table ? ` · Table ${table}` : ""}
    </span>
  );
}
