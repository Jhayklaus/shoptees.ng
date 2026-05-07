"use client";

import Link from "next/link";
import { mainNav } from "@/config/nav";
import { CartButton } from "@/components/cart/CartButton";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-paper/85 backdrop-blur-md border-b border-line">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 h-16 flex items-center justify-between">
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 -ml-2"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-7">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-mono-tight text-ink hover:text-vermillion transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          aria-label="Shoptees home"
          className="absolute left-1/2 -translate-x-1/2 select-none"
        >
          <span className="font-display text-2xl md:text-[1.7rem] tracking-[-0.02em] leading-none">
            Shop<span className="font-italic-accent text-vermillion">tees</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/shop"
            className="hidden md:inline-flex font-mono-tight text-ink hover:text-vermillion transition-colors mr-2"
          >
            Shop
          </Link>
          <CartButton />
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-line bg-paper">
          <ul className="px-5 py-4 space-y-3">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="font-display text-2xl tracking-tight"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/shop"
                onClick={() => setOpen(false)}
                className="font-display text-2xl tracking-tight"
              >
                Shop
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
