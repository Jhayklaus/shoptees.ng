"use client";

import Link from "next/link";
import Image from "next/image";
import { mainNav, type NavItem } from "@/config/nav";
import { CartButton } from "@/components/cart/CartButton";
import { CurrencySwitcher } from "@/components/currency/CurrencySwitcher";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ChevronDown, ArrowUpRight } from "lucide-react";

type NavLink = { slug: string; name: string };

// Dropdown content per nav `kind`. Collections are curated lines ("Urban
// Retro") with dedicated pages; categories are product types ("Hoodies")
// that filter /shop.
function dropdownItems(
  kind: "collections" | "categories",
  collections: NavLink[],
  categories: NavLink[],
) {
  return kind === "collections"
    ? {
        items: collections.map((c) => ({ name: c.name, href: `/collections/${c.slug}` })),
        emptyLabel: "No collections yet",
        footer: { label: "All collections →", href: "/collections" },
      }
    : {
        items: categories.map((c) => ({ name: c.name, href: `/shop?c=${c.slug}` })),
        emptyLabel: "No categories yet",
        footer: { label: "See everything →", href: "/shop" },
      };
}

export function Header({
  collections,
  categories,
}: {
  collections: NavLink[];
  categories: NavLink[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      data-vt="header"
      className="header-scroll sticky top-0 z-40 bg-paper/95 backdrop-blur-md border-b-2 border-ink"
    >
      {/* The wordmark sits at the start of the line, not floated to the
          centre of it. A centred mark with nav left and cart right is a
          symmetrical arrangement that reads as a template; anchoring it left
          lets the nav run on from it and gives the row a direction. */}
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 h-16 md:h-[4.6rem] flex items-center gap-4 md:gap-6">
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden p-2 -ml-2 text-ink"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link href="/" aria-label="Shoptees home" className="select-none shrink-0">
          <Image
            src="/logo.png"
            alt="Shoptees"
            width={94}
            height={94}
            priority
            className="h-10 w-auto md:h-[3.1rem] object-contain"
          />
        </Link>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-7">
          {mainNav.map((item, i) =>
            item.type === "link" ? (
              <Link
                key={item.href}
                href={item.href}
                className="link-underline font-condensed text-[0.84rem] text-ink hover:text-vermillion transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <NavDropdown
                key={`dd-${i}`}
                label={item.label}
                {...dropdownItems(item.kind, collections, categories)}
              />
            ),
          )}
        </nav>

        <div className="ml-auto flex items-center gap-3 shrink-0">
          <CurrencySwitcher className="hidden sm:inline-flex" />
          <CartButton />
        </div>
      </div>

      {menuOpen && (
        <MobileMenu
          items={mainNav}
          collections={collections}
          categories={categories}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </header>
  );
}

// ── Desktop dropdown ────────────────────────────────────────────────────────

function NavDropdown({
  label,
  items,
  emptyLabel,
  footer,
}: {
  label: string;
  items: { name: string; href: string }[];
  emptyLabel: string;
  footer: { label: string; href: string };
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
        className="link-underline inline-flex items-center gap-1 font-condensed text-[0.84rem] text-ink hover:text-vermillion transition-colors"
      >
        {label}
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Panel — anchored to the trigger, lifted off the bar with the same
          shadow the product tiles use rather than its own effect. */}
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
            "relative min-w-[250px] bg-paper border-2 border-ink shadow-lift-lg origin-top-left",
            "transition-all duration-200 ease-out",
            open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1",
          ].join(" ")}
        >
          {/* Hazard top tick */}
          <span className="absolute top-0 left-0 w-8 h-[3px] bg-vermillion" />

          <ul className="py-2">
            {items.length === 0 ? (
              <li className="px-4 py-2 font-mono-tight text-muted normal-case">
                {emptyLabel}
              </li>
            ) : (
              items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    role="menuitem"
                    className="group flex items-center justify-between gap-4 px-4 py-2 font-mono-tight text-ink hover:bg-ink hover:text-paper transition-colors"
                  >
                    <span>{item.name}</span>
                    <ArrowUpRight
                      size={14}
                      className="text-vermillion opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-paper transition-all duration-150"
                    />
                  </Link>
                </li>
              ))
            )}
          </ul>
          <div className="border-t border-line">
            <Link
              href={footer.href}
              onClick={() => setOpen(false)}
              role="menuitem"
              className="block px-4 py-2.5 font-mono-tight text-muted hover:text-ink hover:bg-ink/5 transition-colors"
            >
              {footer.label}
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
  collections,
  categories,
  onClose,
}: {
  items: NavItem[];
  collections: NavLink[];
  categories: NavLink[];
  onClose: () => void;
}) {
  // Track open state per dropdown kind so Collections and Categories
  // expand independently. Collections starts open as the lead section.
  const [openKinds, setOpenKinds] = useState<Record<string, boolean>>({
    collections: true,
  });
  const toggleKind = (kind: string) =>
    setOpenKinds((s) => ({ ...s, [kind]: !s[kind] }));

  return (
    <div className="sheet-in md:hidden border-t-2 border-ink bg-paper">
      <ul className="px-5 py-5 space-y-4">
        {items.map((item, i) => {
          if (item.type === "link") {
            return (
              <li key={item.href} style={{ "--i": i } as React.CSSProperties}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="font-display text-[2rem] block"
                >
                  {item.label}
                </Link>
              </li>
            );
          }
          const open = Boolean(openKinds[item.kind]);
          const { items: links, emptyLabel, footer } = dropdownItems(item.kind, collections, categories);
          return (
            <li key={`m-dd-${i}`} style={{ "--i": i } as React.CSSProperties}>
              <button
                type="button"
                onClick={() => toggleKind(item.kind)}
                aria-expanded={open}
                className="inline-flex items-center gap-2 font-display text-[2rem]"
              >
                {item.label}
                <ChevronDown
                  size={18}
                  className={`transition-transform ${open ? "rotate-180" : ""}`}
                />
              </button>
              {open && (
                <ul className="mt-3 pl-3 border-l-2 border-line space-y-2.5">
                  {links.length === 0 ? (
                    <li className="font-mono-tight text-muted normal-case">{emptyLabel}</li>
                  ) : (
                    links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={onClose}
                          className="font-mono-tight text-ink hover:text-vermillion transition-colors block py-0.5"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))
                  )}
                  <li>
                    <Link
                      href={footer.href}
                      onClick={onClose}
                      className="font-mono-tight text-muted hover:text-vermillion transition-colors block py-0.5"
                    >
                      {footer.label}
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      <div className="px-5 pb-5 sm:hidden border-t border-line pt-4">
        <p className="font-mono-tight text-muted mb-2">Currency</p>
        <CurrencySwitcher />
      </div>
    </div>
  );
}
