"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { GripVertical } from "lucide-react";
import { reorderBannersAction } from "@/app/admin/(authed)/banners/actions";

export type BannerRow = {
  id: string;
  title: string;
  eyebrow: string;
  enabled: boolean;
  layout: string;
  imageUrl: string;
  imageAlt: string;
};

export function BannerList({ banners }: { banners: BannerRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<BannerRow[]>(banners);
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
        setRows(banners); // revert to server order on failure
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
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="font-mono-tight text-ink/55 text-xs">
          Drag rows to reorder — the order here is the order on the homepage.
        </p>
        {saving && <p className="font-mono-tight text-ink/40 text-xs">Saving order…</p>}
      </div>

      {error && (
        <p className="mb-3 bg-vermillion/10 border-l-2 border-vermillion px-3 py-2 font-mono-tight text-ink-soft">
          {error}
        </p>
      )}

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
              overId === b.id && dragId !== b.id ? "bg-vermillion/5 border-l-2 border-vermillion" : "",
            ].join(" ")}
          >
            <span
              className="cursor-grab active:cursor-grabbing text-ink/30 hover:text-ink shrink-0"
              aria-hidden
            >
              <GripVertical size={16} />
            </span>

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
                <p className="font-mono-tight text-ink/40 text-[0.65rem] truncate">{b.eyebrow}</p>
              )}
            </div>

            <span className="font-italic-accent text-ink-soft text-sm hidden sm:inline shrink-0">
              {b.layout === "imageRight" ? "Image right" : "Image left"}
            </span>

            <span
              className={[
                "inline-block px-2 py-0.5 font-mono-tight text-[0.65rem] uppercase tracking-wider shrink-0",
                b.enabled
                  ? "bg-ink text-paper"
                  : "bg-vermillion/10 text-vermillion border border-vermillion/40",
              ].join(" ")}
            >
              {b.enabled ? "Live" : "Hidden"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
