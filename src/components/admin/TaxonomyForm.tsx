"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { slugify } from "@/lib/utils";
import { SingleImagePicker } from "@/components/admin/SingleImagePicker";

// One form for both catalogue groupings — collections ("Urban Retro") and
// categories ("Hoodies"). Same fields either way; collections additionally
// carry a banner image and a description used in SEO copy.

export type TaxonomyFormInitial = {
  id?: string;
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  sortOrder: number;
};

type Props = {
  noun: "collection" | "category";
  listHref: string;
  withDescription?: boolean;
  withImage?: boolean;
  initial: TaxonomyFormInitial;
  action: (
    input: TaxonomyFormInitial
  ) => Promise<{ ok: true; id: string } | { ok: false; error: string }>;
  deleteAction?: () => Promise<{ ok: true } | { ok: false; error: string }>;
  productCount?: number;
};

export function TaxonomyForm({
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
            className="w-full bg-transparent border-b border-line py-2 outline-none focus:border-ink font-mono-tight"
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
          <SingleImagePicker
            label="Banner image"
            value={state.imageUrl ?? ""}
            onChange={(url) => update("imageUrl", url)}
            altValue={state.imageAlt ?? ""}
            onAltChange={(alt) => update("imageAlt", alt)}
          />
        )}
        <Field label="Sort order" hint="Lower numbers show first.">
          <input
            type="number"
            value={state.sortOrder}
            onChange={(e) => update("sortOrder", parseInt(e.target.value) || 0)}
            className="w-28 bg-transparent border-b border-line py-2 outline-none focus:border-ink font-mono-tight"
          />
        </Field>
      </div>

      {error && (
        <p className="bg-vermillion/10 border-l-2 border-vermillion px-3 py-2 font-mono-tight text-ink-soft">
          {error}
        </p>
      )}

      <div className="space-y-2">
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-ink text-paper py-3 font-mono-tight hover:bg-vermillion transition-colors disabled:opacity-50"
        >
          {pending ? "Saving…" : initial.id ? "Save changes" : `Create ${noun}`}
        </button>
        {initial.id && deleteAction && (
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="w-full border border-line py-3 font-mono-tight text-ink/55 hover:border-vermillion hover:text-vermillion disabled:opacity-50"
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
      <label className="font-mono-tight text-ink/55 block mb-1">
        {label}
        {required && <span className="text-vermillion"> *</span>}
        {hint && <span className="text-ink/40 normal-case ml-2">{hint}</span>}
      </label>
      {children}
    </div>
  );
}
