"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { slugify } from "@/lib/utils";
import { SingleImagePicker } from "@/components/admin/SingleImagePicker";
import { PRODUCT_STATUSES } from "@/lib/constants";

// One form for both catalogue groupings — collections ("Urban Retro") and
// categories ("Hoodies"). Same fields either way; collections additionally
// carry a description used in SEO copy and TWO images, because the two
// places a collection appears want different crops: a wide banner for when
// it leads the homepage, and a squarer card for the featured row and the
// /collections grid.

export type TaxonomyFormInitial = {
  id?: string;
  slug: string;
  name: string;
  description?: string;
  bannerImageUrl?: string;
  bannerImageAlt?: string;
  cardImageUrl?: string;
  cardImageAlt?: string;
  /** Collections only — hand-picks the homepage's featured row. */
  featured?: boolean;
  sortOrder: number;
  /** Collections only — categories are always live. */
  status?: string;
};

type Props = {
  noun: "collection" | "category";
  listHref: string;
  withDescription?: boolean;
  withImage?: boolean;
  /** Show the Draft / Live control. */
  withStatus?: boolean;
  initial: TaxonomyFormInitial;
  action: (
    input: TaxonomyFormInitial
  ) => Promise<{ ok: true; id: string } | { ok: false; error: string }>;
  deleteAction?: () => Promise<{ ok: true } | { ok: false; error: string }>;
  productCount?: number;
};

export function TaxonomyForm({
  withStatus,
  noun,
  listHref,
  withDescription,
  withImage,
  initial,
  action,
  deleteAction,
  productCount,
}: Props) {
  const router = useRouter();
  const [state, setState] = useState<TaxonomyFormInitial>(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));

  const update = <K extends keyof TaxonomyFormInitial>(k: K, v: TaxonomyFormInitial[K]) =>
    setState((s) => ({ ...s, [k]: v }));

  const onNameChange = (name: string) => {
    setState((s) => ({
      ...s,
      name,
      slug: slugTouched ? s.slug : slugify(name),
    }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!state.name.trim()) return setError("Name is required");
    if (!state.slug.trim()) return setError("Slug is required");

    startTransition(async () => {
      const res = await action(state);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push(listHref);
      router.refresh();
    });
  };

  const onDelete = () => {
    if (!deleteAction) return;
    const warning =
      productCount && productCount > 0
        ? `Delete "${state.name}"? ${productCount} product${productCount === 1 ? "" : "s"} will lose this ${noun} (they won't be deleted).`
        : `Delete "${state.name}"? This cannot be undone.`;
    if (!confirm(warning)) return;
    startTransition(async () => {
      const res = await deleteAction();
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push(listHref);
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="max-w-xl px-8 py-8 space-y-6">
      <div className="border border-line p-5 space-y-5">
        <Field label="Name" required>
          <input
            value={state.name}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full bg-transparent border-b border-line py-2 outline-none focus:border-ink font-display text-xl"
          />
        </Field>
        <Field label="Slug" required hint={`URL — /shop?${noun === "category" ? "c" : "collection"}=your-slug`}>
          <input
            value={state.slug}
            onChange={(e) => {
              setSlugTouched(true);
              update("slug", e.target.value);
            }}
            className="w-full bg-transparent border-b border-line py-2 outline-none focus:border-ink font-label"
          />
        </Field>
        {withDescription && (
          <Field label="Description" hint="Optional — used for search snippets.">
            <textarea
              value={state.description ?? ""}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              className="w-full bg-transparent border border-line p-3 outline-none focus:border-ink resize-none"
            />
          </Field>
        )}
        {withImage && (
          <>
            <SingleImagePicker
              label="Banner image"
              hint="Wide. Used when this collection leads the homepage — the hero, or the feature block."
              value={state.bannerImageUrl ?? ""}
              onChange={(url) => update("bannerImageUrl", url)}
              altValue={state.bannerImageAlt ?? ""}
              onAltChange={(alt) => update("bannerImageAlt", alt)}
            />
            <SingleImagePicker
              label="Card image"
              hint="Squarer. The tile in the homepage's featured row and on the collections page."
              value={state.cardImageUrl ?? ""}
              onChange={(url) => update("cardImageUrl", url)}
              altValue={state.cardImageAlt ?? ""}
              onAltChange={(alt) => update("cardImageAlt", alt)}
            />
            <Field
              label="Feature on the homepage"
              hint="The homepage shows three. With none ticked it falls back to the first three by sort order."
            >
              <label className="inline-flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={state.featured ?? false}
                  onChange={(e) => update("featured", e.target.checked)}
                  className="w-4 h-4 accent-[var(--vermillion)]"
                />
                <span className="font-label text-ink-soft">
                  {state.featured ? "Shown in the featured row" : "Not featured"}
                </span>
              </label>
            </Field>
          </>
        )}
        <Field label="Sort order" hint="Lower numbers show first.">
          <input
            type="number"
            value={state.sortOrder}
            onChange={(e) => update("sortOrder", parseInt(e.target.value) || 0)}
            className="w-28 bg-transparent border-b border-line py-2 outline-none focus:border-ink font-label"
          />
        </Field>
        {withStatus && (
          <Field
            label="Status"
            hint="Drafts are invisible on the storefront — no listing, no page, not in the sitemap."
          >
            <select
              value={state.status ?? "DRAFT"}
              onChange={(e) => update("status", e.target.value)}
              className="bg-transparent border-b border-line py-2 outline-none focus:border-ink font-label"
            >
              {PRODUCT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === "ACTIVE" ? "Live" : s === "DRAFT" ? "Draft" : "Archived"}
                </option>
              ))}
            </select>
          </Field>
        )}
      </div>

      {error && (
        <p className="bg-vermillion/10 border-l-2 border-vermillion px-3 py-2 font-label text-ink-soft">
          {error}
        </p>
      )}

      <div className="space-y-2">
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-ink text-paper py-3 font-label hover:bg-vermillion transition-colors disabled:opacity-50"
        >
          {pending ? "Saving…" : initial.id ? "Save changes" : `Create ${noun}`}
        </button>
        {initial.id && deleteAction && (
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="w-full border border-line py-3 font-label text-ink/55 hover:border-vermillion hover:text-vermillion disabled:opacity-50"
          >
            Delete {noun}
          </button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="font-label text-ink/55 block mb-1">
        {label}
        {required && <span className="text-vermillion"> *</span>}
        {hint && <span className="text-ink/40 normal-case ml-2">{hint}</span>}
      </label>
      {children}
    </div>
  );
}
