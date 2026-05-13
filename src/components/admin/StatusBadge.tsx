const orderMap: Record<string, string> = {
  PENDING: "bg-paper-deep text-ink-soft border-line",
  PAID: "bg-ink text-paper border-ink",
  FULFILLED: "bg-vermillion text-paper border-vermillion",
  CANCELLED: "bg-paper text-ink/40 border-line line-through",
};

const productMap: Record<string, string> = {
  DRAFT: "bg-paper-deep text-ink-soft border-line",
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
  return (
    <span className={`font-mono-tight inline-block px-2 py-0.5 border ${map[status] ?? "border-line"}`}>
      {status.toLowerCase()}
    </span>
  );
}
