import { PRODUCT_STATUS_LABELS } from "@/lib/constants";

const orderMap: Record<string, string> = {
  PENDING: "bg-paper-deep text-ink-soft border-line",
  PAID: "bg-ink text-paper border-ink",
  FULFILLED: "bg-vermillion text-paper border-vermillion",
  CANCELLED: "bg-paper text-ink/40 border-line line-through",
};

const productMap: Record<string, string> = {
  DRAFT: "bg-paper-deep text-ink-soft border-line",
  // Outlined in ink rather than filled: on the storefront but not for sale,
  // so it should read as neither a draft nor a live piece at a glance down
  // the status column.
  COMING_SOON: "bg-paper text-ink border-ink border-dashed",
  ACTIVE: "bg-ink text-paper border-ink",
  ARCHIVED: "bg-paper text-ink/40 border-line",
};

export function StatusBadge({
  status,
  variant = "order",
}: {
  status: string;
  variant?: "order" | "product";
}) {
  const map = variant === "product" ? productMap : orderMap;
  // COMING_SOON would otherwise print as "coming_soon".
  const labels: Record<string, string> = PRODUCT_STATUS_LABELS;
  const label = variant === "product" ? labels[status] ?? status : status;
  return (
    <span className={`font-label inline-block px-2 py-0.5 border ${map[status] ?? "border-line"}`}>
      {label.toLowerCase()}
    </span>
  );
}
