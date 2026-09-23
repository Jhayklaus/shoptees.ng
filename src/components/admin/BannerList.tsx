"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { GripVertical, LayoutTemplate } from "lucide-react";
import { reorderBannersAction } from "@/app/admin/(authed)/banners/actions";

export type BannerRow = {
  id: string;
  slot: string;
  title: string;
  eyebrow: string;
  enabled: boolean;
  imageUrl: string;
  imageAlt: string;
};

export function BannerList({ banners }: { banners: BannerRow[] }) {
  const router = useRouter();
  const heroBanner = banners.find((b) => b.slot === "hero");
  const featureBanner = banners.find((b) => b.slot === "feature");
  // Only the stack is draggable; the two singletons sit above it in fixed
  // positions that mirror where they appear on the homepage.
  const regularBanners = banners.filter((b) => b.slot !== "hero" && b.slot !== "feature");

  const [rows, setRows] = useState<BannerRow[]>(regularBanners);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [saving, startSave] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const persist = (ordered: BannerRow[]) => {
    setError(null);
    startSave(async () => {
      const res = await reorderBannersAction(ordered.map((r) => r.id));
      if (!res.ok) {
        setError(res.error);
        setRows(regularBanners);
        return;
      }
      router.refresh();
    });
  };

  const onDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      setOverId(null);
      return;
    }
    const next = [...rows];
    const from = next.findIndex((r) => r.id === dragId);
    const to = next.findIndex((r) => r.id === targetId);
    if (from === -1 || to === -1) return;
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setRows(next);
    setDragId(null);
    setOverId(null);
    persist(next);
  };

  return (
    <div className="space-y-8">
      {/* The two fixed slots — always shown, cannot be deleted or reordered. */}
      <SingletonSlot
        banner={heroBanner}
        slug="hero"
        label="Hero slot"
        where="appears at the very top of the homepage"
        empty="No hero banner set yet."
        badge="Hero"
      />

      <SingletonSlot
        banner={featureBanner}
        slug="feature"
        label="Feature slot"
        where="the editorial block mid-page, under the New in grid"
        empty="No feature banner set — the homepage is showing its built-in default."
        badge="Feature"
      />

      {/* Regular banners — draggable */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="font-label text-ink/55 text-xs uppercase tracking-wider">
            Campaign banners · drag to reorder
          </p>
          {saving && <p className="font-label text-ink/40 text-xs">Saving order…</p>}
        </div>

        {error && (
          <p className="mb-3 bg-vermillion/10 border-l-2 border-vermillion px-3 py-2 font-label text-ink-soft">
            {error}
          </p>
        )}

        {rows.length === 0 ? (
          <p className="font-italic-accent text-ink/40 py-6 border border-dashed border-line text-center">
            No campaign banners yet.
          </p>
        ) : (
          <ul className="border border-line divide-y divide-line">
            {rows.map((b) => (
              <li
                key={b.id}
                draggable
                onDragStart={() => setDragId(b.id)}
                onDragEnd={() => {
                  setDragId(null);
                  setOverId(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (overId !== b.id) setOverId(b.id);
                }}
                onDrop={() => onDrop(b.id)}
                className={[
                  "flex items-center gap-3 px-3 py-3 bg-paper transition-colors",
                  dragId === b.id ? "opacity-40" : "",
                  overId === b.id && dragId !== b.id
                    ? "bg-vermillion/5 border-l-2 border-vermillion"
                    : "",
                ].join(" ")}
              >
                <span
                  className="cursor-grab active:cursor-grabbing text-ink/30 hover:text-ink shrink-0"
                  aria-hidden
                >
                  <GripVertical size={16} />
                </span>
                <BannerCard banner={b} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function BannerCard({ banner: b, badge }: { banner: BannerRow; badge?: string }) {
  return (
    <div
      className={[
        "flex items-center gap-3 w-full",
        badge ? "border border-line px-3 py-3" : "",
      ].join(" ")}
    >
      {b.imageUrl ? (
        <div className="relative w-16 h-12 bg-paper-deep shrink-0">
          <Image src={b.imageUrl} alt={b.imageAlt} fill sizes="64px" className="object-cover" />
        </div>
      ) : (
        <div className="w-16 h-12 bg-paper-deep border border-line shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <Link
          href={`/admin/banners/${b.id}`}
          className="font-display text-lg leading-tight hover:text-vermillion"
        >
          {b.title}
        </Link>
        {b.eyebrow && (
          <p className="font-label text-ink/40 text-[0.65rem] truncate">{b.eyebrow}</p>
        )}
      </div>

      {badge && (
        <span className="font-label text-[0.65rem] uppercase tracking-wider text-ink/40 hidden sm:inline shrink-0">
          {badge}
        </span>
      )}

      <span
        className={[
          "inline-block px-2 py-0.5 font-label text-[0.65rem] uppercase tracking-wider shrink-0",
          b.enabled
            ? "bg-ink text-paper"
            : "bg-vermillion/10 text-vermillion border border-vermillion/40",
        ].join(" ")}
      >
        {b.enabled ? "Live" : "Hidden"}
      </span>
    </div>
  );
}

/**
 * One of the fixed homepage slots. Shows the row if it exists, or a prompt
 * that links to /admin/banners/<slot> — a route the edit page resolves into a
 * blank form bound to that slot.
 */
function SingletonSlot({
  banner,
  slug,
  label,
  where,
  empty,
  badge,
}: {
  banner?: BannerRow;
  slug: string;
  label: string;
  where: string;
  empty: string;
  badge: string;
}) {
  return (
    <div>
      <p className="font-label text-ink/55 text-xs mb-3 uppercase tracking-wider">
        {label} · {where}
      </p>
      {banner ? (
        <BannerCard banner={banner} badge={badge} />
      ) : (
        <div className="border border-dashed border-line p-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-ink/40">
            <LayoutTemplate size={18} />
            <p className="font-label text-sm normal-case tracking-normal">{empty}</p>
          </div>
          <Link
            href={`/admin/banners/${slug}`}
            className="border border-ink px-4 py-2 font-label text-sm hover:bg-ink hover:text-paper transition-colors shrink-0"
          >
            Set up →
          </Link>
        </div>
      )}
    </div>
  );
}
