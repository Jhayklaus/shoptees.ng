"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SlidersHorizontal, X, Minus, Plus } from "lucide-react";

type Term = { slug: string; name: string; count?: number };

/**
 * Shop filters.
 *
 * An inline sidebar on desktop, the same content behind a trigger on mobile.
 * It used to be a slide-over at every width, which hid the one piece of UI
 * that tells a customer how big the catalogue is and how it is divided —
 * on a storefront the filters are part of the furniture, not a modal.
 *
 * Only collection and category are offered, because only collection and
 * category are actually filterable: /shop reads `collection` and `c` and
 * nothing else. Size, colour and price groups would need a change to the
 * product query, which is out of scope here — see the note in the gate
 * write-up rather than shipping controls that do nothing.
 */
export function FilterRail({
  collections,
  categories,
  activeCollection,
  activeCategory,
  total,
}: {
  collections: Term[];
  categories: Term[];
  activeCollection: string | null;
  activeCategory: string | null;
  total: number;
}) {
  const [open, setOpen] = useState(false);

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

  const body = (
    <>
      <Group label="Collection">
        <Row href={collectionHref()} on={!activeCollection} onClick={() => setOpen(false)}>
          All
        </Row>
        {collections.map((c) => (
          <Row
            key={c.slug}
            href={collectionHref(c.slug)}
            on={c.slug === activeCollection}
            count={c.count}
            onClick={() => setOpen(false)}
          >
            {c.name}
          </Row>
        ))}
      </Group>

      <Group label="Category">
        <Row href={categoryHref()} on={!activeCategory} onClick={() => setOpen(false)}>
          All
        </Row>
        {categories.map((c) => (
          <Row
            key={c.slug}
            href={categoryHref(c.slug)}
            on={c.slug === activeCategory}
            count={c.count}
            onClick={() => setOpen(false)}
          >
            {c.name}
          </Row>
        ))}
      </Group>

      {activeCount > 0 && (
        <Link
          href="/shop"
          onClick={() => setOpen(false)}
          className="font-label text-muted hover:text-vermillion transition-colors inline-block mt-1"
        >
          Clear all ({activeCount}) ×
        </Link>
      )}
    </>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden lg:block" aria-label="Filters">
        <p className="font-section border-b border-ink pb-2 mb-4">
          Filter
          <span className="font-label text-muted ml-2.5 tnum">
            {String(total).padStart(2, "0")}
          </span>
        </p>
        {body}
      </aside>

      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        className="lg:hidden btn btn-ghost press py-2.5 px-4"
      >
        <SlidersHorizontal size={14} />
        Filter
        {activeCount > 0 && (
          <span className="bg-vermillion text-paper px-1.5 py-0.5 text-[0.62rem] leading-none">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/40"
          />
          <aside className="absolute right-0 top-0 h-full w-[88vw] max-w-[22rem] bg-paper border-l-2 border-ink flex flex-col">
            <header className="flex items-center justify-between px-6 h-16 border-b border-ink shrink-0">
              <p className="font-section">Filter</p>
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setOpen(false)}
                className="p-2 -mr-2 hover:text-vermillion"
              >
                <X size={18} />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-6">{body}</div>
          </aside>
        </div>
      )}
    </>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-6 border-b border-line pb-5 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center justify-between w-full font-label text-ink mb-2.5"
      >
        {label}
        {open ? <Minus size={13} /> : <Plus size={13} />}
      </button>
      {open && <ul className="grid gap-0.5">{children}</ul>}
    </div>
  );
}

function Row({
  href,
  on,
  count,
  onClick,
  children,
}: {
  href: string;
  on: boolean;
  count?: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        scroll={false}
        onClick={onClick}
        aria-current={on ? "true" : undefined}
        className={[
          "flex items-center justify-between gap-3 py-1.5 text-[0.88rem] transition-colors",
          on ? "text-ink font-semibold" : "text-ink-soft hover:text-ink",
        ].join(" ")}
      >
        <span className="inline-flex items-center gap-2.5">
          {/* A box, not a bullet — it reads as a filter you can switch off. */}
          <span
            aria-hidden
            className={[
              "w-3.5 h-3.5 border shrink-0 transition-colors",
              on ? "bg-ink border-ink" : "border-line-2",
            ].join(" ")}
          />
          {children}
        </span>
        {count != null && <span className="font-label text-muted tnum">{count}</span>}
      </Link>
    </li>
  );
}
