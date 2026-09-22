"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Report = {
  applied: boolean;
  designs: number;
  colourways: number;
  categories: { slug: string; action: string }[];
  collections: { slug: string; action: string; status: string }[];
  products: {
    slug: string;
    name: string;
    action: string;
    reason?: string;
    colourways: number;
    variants: number;
  }[];
};

const CONFIRM = "IMPORT ARCHIVE";

export function ImportArchivePanel({
  designs,
  colourways,
}: {
  designs: number;
  colourways: number;
}) {
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState("");
  const [pending, startTransition] = useTransition();

  const run = (apply: boolean) => {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/admin/import-archive", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ apply, confirm }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? "Import failed");
        return;
      }
      setReport(body as Report);
      if (apply) router.refresh();
    });
  };

  const created = report?.products.filter((p) => p.action === "created").length ?? 0;
  const updated = report?.products.filter((p) => p.action === "updated").length ?? 0;
  const skipped = report?.products.filter((p) => p.action === "skipped") ?? [];
  const newCategories = report?.categories.filter((c) => c.action === "created") ?? [];
  const newCollections = report?.collections.filter((c) => c.action === "created") ?? [];

  return (
    <div className="max-w-3xl space-y-8">
      <section className="border-2 border-ink p-5 space-y-3">
        <p className="font-display text-2xl">
          {designs} designs · {colourways} colourways
        </p>
        <p className="font-italic-accent text-ink-soft">
          Imports the Collection Archive as <strong>drafts</strong> — six collections and{" "}
          {designs} products, each colourway a variant at zero stock. Nothing appears on the
          storefront until you publish it yourself.
        </p>
        <p className="bg-vermillion/10 border-l-2 border-vermillion px-3 py-2 font-label text-ink-soft">
          Every product imports at ₦0. The figures in the merch reference are what a sample
          costs to produce, not what it sells for — each product carries its sample cost in
          the description. Set real prices before publishing.
        </p>
        <p className="font-label text-ink/55">
          Creates any missing categories and collections itself — nothing to run beforehand.
          Safe to run more than once: it matches on slug, so a second run updates rather than
          duplicating.
        </p>
      </section>

      <div className="flex flex-wrap items-end gap-4">
        <button
          type="button"
          onClick={() => run(false)}
          disabled={pending}
          className="press border-2 border-ink px-5 py-3 font-condensed text-[0.78rem] hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
        >
          {pending ? "Working…" : "Preview (changes nothing)"}
        </button>

        <div>
          <label htmlFor="confirm" className="block font-label text-ink/55 mb-1">
            Type {CONFIRM} to enable import
          </label>
          <input
            id="confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={CONFIRM}
            className="border-b-2 border-line focus:border-vermillion outline-none py-2 font-label w-56 bg-transparent"
          />
        </div>

        <button
          type="button"
          onClick={() => run(true)}
          disabled={pending || confirm !== CONFIRM}
          className="press btn-wipe btn-wipe-hazard bg-ink text-paper px-5 py-3 font-condensed text-[0.78rem] transition-colors disabled:opacity-40"
        >
          Import as drafts
        </button>
      </div>

      {error && (
        <p className="bg-vermillion/10 border-l-2 border-vermillion px-3 py-2 font-label text-ink-soft">
          {error}
        </p>
      )}

      {report && (
        <section className="border-2 border-ink p-5 space-y-4">
          <p className="font-display text-2xl">
            {report.applied ? "Imported" : "Preview"} — {created} created, {updated} updated
            {skipped.length > 0 && `, ${skipped.length} skipped`}
          </p>

          {skipped.length > 0 && (
            <div className="bg-vermillion/10 border-l-2 border-vermillion px-3 py-2">
              <p className="font-label text-ink-soft mb-1">
                Skipped — these could not be placed:
              </p>
              <ul className="font-label text-ink-soft">
                {skipped.map((p) => (
                  <li key={p.slug}>
                    {p.slug} — {p.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="font-label text-ink/55 mb-2">
              Categories — {newCategories.length} to create,{" "}
              {report.categories.length - newCategories.length} already there
            </p>
            {newCategories.length > 0 && (
              <ul className="font-label space-y-1 mb-4">
                {newCategories.map((c) => (
                  <li key={c.slug} className="flex justify-between border-b border-line py-1">
                    <span>{c.slug}</span>
                    <span className="text-ink/55">created</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="font-label text-ink/55 mb-2">
              Collections — {newCollections.length} to create as drafts,{" "}
              {report.collections.length - newCollections.length} already there
            </p>
            <ul className="font-label space-y-1">
              {report.collections.map((c) => (
                <li key={c.slug} className="flex justify-between border-b border-line py-1">
                  <span>{c.slug}</span>
                  <span className="text-ink/55">
                    {c.action === "created" ? "created as draft" : `already exists (${c.status.toLowerCase()})`}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-label text-ink/55 mb-2">Products</p>
            <ul className="font-label space-y-1">
              {report.products.map((p) => (
                <li key={p.slug} className="flex justify-between gap-4 border-b border-line py-1">
                  <span className="truncate">{p.name}</span>
                  <span className="text-ink/55 whitespace-nowrap">
                    {p.colourways} colourway{p.colourways === 1 ? "" : "s"} · {p.variants} variant
                    {p.variants === 1 ? "" : "s"} · {p.action}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {report.applied && (
            <p className="font-italic-accent text-ink-soft">
              All drafts. Review in Products, set prices and stock, then publish.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
