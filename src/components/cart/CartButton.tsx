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
      className="relative inline-flex items-center justify-center h-9 w-9 hover:bg-ink hover:text-paper transition-colors"
    >
      <ShoppingBag size={18} strokeWidth={1.8} />
      {hydrated && count > 0 && (
        <span
          // Re-keying on count replays the pop, so every add "ticks" the badge.
          key={count}
          className="pop-in absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-vermillion text-paper text-[10px] font-mono-tight flex items-center justify-center"
        >
          {count}
        </span>
      )}
    </Link>
  );
}
