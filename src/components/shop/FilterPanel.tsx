"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

type Term = { slug: string; name: string };

// Shop filters live behind this trigger: a slide-in panel from the right
// listing collections and categories as links. Picking a collection drops
// the category (the new collection may not carry it); picking a category
// keeps the active collection. Mirrors the chip logic the panel replaced.
export function FilterPanel({
  collections,
  categories,
  activeCollection,
  activeCategory,
}: {
  collections: Term[];
  categories: Term[];
  activeCollection: string | null;
  activeCategory: string | null;
}) {
  const [open, setOpen] = useState(false);

  // Escape closes; lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const collectionHref = (slug?: string) => (slug ? `/shop?collection=${slug}` : "/shop");
  const categoryHref = (slug?: string) => {
    const col = activeCollection ? `collection=${activeCollection}` : "";
    const cat = slug ? `c=${slug}` : "";
    const qs = [col, cat].filter(Boolean).join("&");
    return qs ? `/shop?${qs}` : "/shop";
  };

  const activeCount = (activeCollection ? 1 : 0) + (activeCategory ? 1 : 0);
  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 border border-line px-4 py-2 font-mono-tight hover:border-ink transition-colors"
      >
        <SlidersHorizontal size={14} />
        Filter
        {activeCount > 0 && (
          <span className="bg-vermillion text-paper px-1.5 py-0.5 text-[0.65rem] leading-none">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <button
            type="button"
            aria-label="Close filters"
            onClick={close}
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
          />

          {/* Panel */}
          <aside className="absolute right-0 top-0 h-full w-[88vw] max-w-[360px] bg-paper border-l border-line flex flex-col">
            <span className="absolute top-0 left-0 w-6 h-px bg-vermillion" />
            <header className="flex items-center justify-between px-6 h-16 border-b border-line shrink-0">
              <p className="font-display text-2xl tracking-tight">
                Filter<span className="font-italic-accent text-vermillion">.</span>
              </p>
              <button
                type="button"
                aria-label="Close filters"
                onClick={close}
                className="p-2 -mr-2 hover:text-vermillion"
              >
                <X size={18} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
              {collections.length > 0 && (
                <FilterGroup label="Collections">
                  <FilterLink
                    href={collectionHref()}
                    selected={!activeCollection}
                    onClick={close}
                  >
                    All
                  </FilterLink>
                  {collections.map((col) => (
                    <FilterLink
                      key={col.slug}
                      href={collectionHref(col.slug)}
                      selected={col.slug === activeCollection}
                      onClick={close}
                    >
                      {col.name}
                    </FilterLink>
                  ))}
                </FilterGroup>
              )}

              {categories.length > 0 && (
                <FilterGroup label="Categories">
                  <FilterLink
                    href={categoryHref()}
                    selected={!activeCategory}
                    onClick={close}
                  >
                    All
                  </FilterLink>
                  {categories.map((cat) => (
                    <FilterLink
                      key={cat.slug}
                      href={categoryHref(cat.slug)}
                      selected={cat.slug === activeCategory}
                      onClick={close}
                    >
                      {cat.name}
                    </FilterLink>
                  ))}
                </FilterGroup>
              )}
            </div>

            {activeCount > 0 && (
              <div className="border-t border-line p-6 shrink-0">
                <Link
                  href="/shop"
                  onClick={close}
                  className="block w-full border border-ink py-3 text-center font-mono-tight hover:bg-ink hover:text-paper transition-colors"
                >
                  Clear all
                </Link>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono-tight text-ink/55 mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterLink({
  href,
  selected,
  onClick,
  children,
}: {
  href: string;
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      onClick={onClick}
      className={[
        "font-mono-tight px-3 py-1.5 border transition-colors",
        selected ? "border-ink bg-ink text-paper" : "border-line hover:border-ink",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
