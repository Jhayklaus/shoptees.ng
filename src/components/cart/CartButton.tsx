"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart";
import { useHydrated } from "@/store/useHydrated";

export function CartButton() {
  const lines = useCart((s) => s.lines);
  const hydrated = useHydrated();

  const count = hydrated ? lines.reduce((n, l) => n + l.quantity, 0) : 0;

  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
      className="relative inline-flex items-center justify-center h-9 w-9 rounded-full hover:bg-ink/5 transition-colors"
    >
      <ShoppingBag size={18} strokeWidth={1.6} />
      {hydrated && count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-vermillion text-paper text-[10px] font-mono-tight flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
}
