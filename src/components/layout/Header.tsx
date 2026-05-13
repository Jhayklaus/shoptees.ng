"use client";

import Link from "next/link";
import Image from "next/image";
import { mainNav, type NavItem } from "@/config/nav";
import { CartButton } from "@/components/cart/CartButton";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ChevronDown, ArrowUpRight } from "lucide-react";

type Category = { slug: string; name: string };

export function Header({ categories }: { categories: Category[] }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-paper/85 backdrop-blur-md border-b border-line">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 h-16 flex items-center justify-between">
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden p-2 -ml-2"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-7">
          {mainNav.map((item, i) =>
            item.type === "link" ? (
              <Link
                key={item.href}
                href={item.href}
                className="font-mono-tight text-ink hover:text-vermillion transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <CollectionsDropdown
                key={`dd-${i}`}
                label={item.label}
                categories={categories}
              />
            ),
          )}
        </nav>

        <Link
          href="/"
          aria-label="Shoptees home"
          className="absolute left-1/2 -translate-x-1/2 select-none"
        >
          <Image
            src="/logo.png"
            alt="Shoptees"
            width={94}
            height={94}
            priority
            className="h-12 w-12 md:h-24 md:w-24 object-contain"
          />
        </Link>

        <div className="flex items-center gap-2">
          <CartButton />
        </div>
      </div>

      {menuOpen && (
        <MobileMenu items={mainNav} categories={categories} onClose={() => setMenuOpen(false)} />
      )}
    </header>
  );
}

// ── Desktop dropdown ────────────────────────────────────────────────────────

function CollectionsDropdown({
  label,
  categories,
}: {
  label: string;
  categories: Category[];
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Outside click + Escape close.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Hover-to-open with a short close delay so the cursor can travel from
  // the trigger to the panel without it snapping shut.
  const openNow = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  };

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 font-mono-tight text-ink hover:text-vermillion transition-colors"
      >
        {label}
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Panel — anchored to the trigger. Uses absolute + small Y translate
          to feel like it lifts off the bar. */}
      <div
        role="menu"
        aria-label={label}
        className={[
          "absolute left-0 top-full pt-3",
          open ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
      >
        <div
          className={[
            "min-w-[240px] bg-paper border border-line shadow-[0_18px_44px_-22px_rgba(0,0,0,0.25)] origin-top-left",
            "transition-all duration-200 ease-out",
            open
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-1",
          ].join(" ")}
        >
          {/* Vermillion top tick — echoes Hero corner ticks */}
          <span className="absolute top-0 left-0 w-6 h-px bg-vermillion" />

          <ul className="py-2">
            {categories.length === 0 ? (
              <li className="px-4 py-2 font-italic-accent text-ink/55 text-sm">
                No collections yet
              </li>
            ) : (
              categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/shop?c=${cat.slug}`}
                    onClick={() => setOpen(false)}
                    role="menuitem"
                    className="group flex items-center justify-between gap-4 px-4 py-2 font-mono-tight text-ink hover:bg-paper-deep transition-colors"
                  >
                    <span>{cat.name}</span>
                    <ArrowUpRight
                      size={14}
                      className="text-vermillion opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150"
                    />
                  </Link>
                </li>
              ))
            )}
          </ul>
          <div className="border-t border-line">
            <Link
              href="/shop"
              onClick={() => setOpen(false)}
              role="menuitem"
              className="block px-4 py-2.5 font-mono-tight text-ink/70 hover:text-ink hover:bg-paper-deep transition-colors"
            >
              See everything →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Mobile menu ─────────────────────────────────────────────────────────────

function MobileMenu({
  items,
  categories,
  onClose,
}: {
  items: NavItem[];
  categories: Category[];
  onClose: () => void;
}) {
  const [collectionsOpen, setCollectionsOpen] = useState(true);

  return (
    <div className="md:hidden border-t border-line bg-paper">
      <ul className="px-5 py-4 space-y-3">
        {items.map((item, i) => {
          if (item.type === "link") {
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="font-display text-2xl tracking-tight"
                >
                  {item.label}
                </Link>
              </li>
            );
          }
          return (
            <li key={`m-dd-${i}`}>
              <button
                type="button"
                onClick={() => setCollectionsOpen((v) => !v)}
                aria-expanded={collectionsOpen}
                className="inline-flex items-center gap-2 font-display text-2xl tracking-tight"
              >
                {item.label}
                <ChevronDown
                  size={18}
                  className={`transition-transform ${collectionsOpen ? "rotate-180" : ""}`}
                />
              </button>
              {collectionsOpen && (
                <ul className="mt-2 pl-3 border-l border-line space-y-2">
                  {categories.length === 0 ? (
                    <li className="font-italic-accent text-ink/55">No collections yet</li>
                  ) : (
                    categories.map((cat) => (
                      <li key={cat.slug}>
                        <Link
                          href={`/shop?c=${cat.slug}`}
                          onClick={onClose}
                          className="font-mono-tight text-ink hover:text-vermillion transition-colors"
                        >
                          {cat.name}
                        </Link>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
