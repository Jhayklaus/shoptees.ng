"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ImageUploader, type AdminImage } from "./ImageUploader";
import { slugify } from "@/lib/utils";
import type { ProductStatus } from "@/lib/constants";

type Variant = {
  id?: string;
  size: string;
  color: string;
  sku: string;
  stock: number;
  priceOverrideNGN: number | null;
};

export type ProductFormInitial = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  priceNGN: number;
  status: ProductStatus;
  categoryId: string | null;
  variants: Variant[];
  images: AdminImage[];
};

type Props = {
  initial: ProductFormInitial;
  categories: { id: string; name: string }[];
  action: (input: ProductFormInitial) => Promise<{ ok: true; id: string } | { ok: false; error: string }>;
  deleteAction?: () => Promise<{ ok: true } | { ok: false; error: string }>;
};

export function ProductForm({ initial, categories, action, deleteAction }: Props) {
  const router = useRouter();
  const [state, setState] = useState<ProductFormInitial>(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));

  const update = <K extends keyof ProductFormInitial>(k: K, v: ProductFormInitial[K]) =>
    setState((s) => ({ ...s, [k]: v }));

  const onNameChange = (name: string) => {
    setState((s) => ({
      ...s,
      name,
      slug: slugTouched ? s.slug : slugify(name),
    }));
  };

  const addVariant = () => {
    update("variants", [
      ...state.variants,
      { size: "M", color: "Default", sku: "", stock: 0, priceOverrideNGN: null },
    ]);
  };
  const removeVariant = (i: number) => update("variants", state.variants.filter((_, j) => j !== i));
  const updateVariant = (i: number, patch: Partial<Variant>) =>
    update(
      "variants",
      state.variants.map((v, j) => (j === i ? { ...v, ...patch } : v))
    );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!state.name.trim()) return setError("Name is required");
    if (!state.slug.trim()) return setError("Slug is required");
    if (state.variants.length === 0) return setError("Add at least one variant");
    const skuSet = new Set<string>();
    for (const v of state.variants) {
      if (!v.sku.trim()) return setError("Every variant needs an SKU");
      if (skuSet.has(v.sku)) return setError(`Duplicate SKU: ${v.sku}`);
      skuSet.add(v.sku);
    }

    startTransition(async () => {
      const res = await action(state);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push(`/admin/products/${res.id}`);
      router.refresh();
    });
  };

  const onDelete = () => {
    if (!deleteAction) return;
    if (!confirm(`Delete "${state.name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deleteAction();
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-12 gap-8 px-8 py-8">
      <div className="col-span-12 lg:col-span-8 space-y-8">
        <Section title="Basics">
          <Field label="Name" required>
            <input
              value={state.name}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full bg-transparent border-b border-line py-2 outline-none focus:border-ink font-display text-xl"
            />
          </Field>
          <Field label="Slug" required hint="URL — /shop/your-slug">
            <input
              value={state.slug}
              onChange={(e) => {
                setSlugTouched(true);
                update("slug", e.target.value);
              }}
              className="w-full bg-transparent border-b border-line py-2 outline-none focus:border-ink font-mono-tight"
            />
          </Field>
          <Field label="Description" required>
            <textarea
              value={state.description}
              onChange={(e) => update("description", e.target.value)}
              rows={5}
              className="w-full bg-transparent border border-line p-3 outline-none focus:border-ink resize-none"
            />
          </Field>
        </Section>

        <Section title="Variants" hint="Add a row per size/colour combination.">
          <div className="border border-line">
            <table className="w-full">
              <thead className="bg-paper-deep border-b border-line">
                <tr>
                  <Th>Size</Th>
                  <Th>Colour</Th>
                  <Th>SKU</Th>
                  <Th>Stock</Th>
                  <Th>Price override (₦)</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {state.variants.map((v, i) => (
                  <tr key={v.id ?? i} className="border-b border-line last:border-0">
                    <Td>
                      <input
                        value={v.size}
                        onChange={(e) => updateVariant(i, { size: e.target.value })}
                        className="w-16 bg-transparent border-b border-line py-1 outline-none focus:border-ink font-mono-tight text-center"
                      />
                    </Td>
                    <Td>
                      <input
                        value={v.color}
                        onChange={(e) => updateVariant(i, { color: e.target.value })}
                        className="w-28 bg-transparent border-b border-line py-1 outline-none focus:border-ink"
                      />
                    </Td>
                    <Td>
                      <input
                        value={v.sku}
                        onChange={(e) => updateVariant(i, { sku: e.target.value })}
                        placeholder="SKU"
                        className="w-32 bg-transparent border-b border-line py-1 outline-none focus:border-ink font-mono-tight"
                      />
                    </Td>
                    <Td>
                      <input
                        type="number"
                        min={0}
                        value={v.stock}
                        onChange={(e) => updateVariant(i, { stock: parseInt(e.target.value) || 0 })}
                        className="w-20 bg-transparent border-b border-line py-1 outline-none focus:border-ink font-mono-tight text-right"
                      />
                    </Td>
                    <Td>
                      <input
                        type="number"
                        min={0}
                        placeholder="—"
                        value={v.priceOverrideNGN ?? ""}
                        onChange={(e) =>
                          updateVariant(i, {
                            priceOverrideNGN: e.target.value === "" ? null : parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-28 bg-transparent border-b border-line py-1 outline-none focus:border-ink font-mono-tight text-right"
                      />
                    </Td>
                    <Td>
                      <button
                        type="button"
                        onClick={() => removeVariant(i)}
                        aria-label="Remove variant"
                        className="text-ink/40 hover:text-vermillion p-2"
                      >
                        <Trash2 size={14} />
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="mt-3 inline-flex items-center gap-2 font-mono-tight border border-line px-3 py-2 hover:border-ink"
          >
            <Plus size={14} /> Add variant
          </button>
        </Section>

        <Section title="Images" hint="Drag to reorder. The first image is the hero.">
          <ImageUploader value={state.images} onChange={(imgs) => update("images", imgs)} />
        </Section>
      </div>

      {/* Right column — meta */}
      <aside className="col-span-12 lg:col-span-4 space-y-6 lg:sticky lg:top-6 self-start">
        <div className="border border-line p-5 space-y-5">
          <Field label="Status">
            <select
              value={state.status}
              onChange={(e) => update("status", e.target.value as ProductStatus)}
              className="w-full bg-transparent border border-line py-2 px-3 outline-none focus:border-ink font-mono-tight"
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </Field>
          <Field label="Price (₦)" required>
            <input
              type="number"
              min={0}
              value={state.priceNGN}
              onChange={(e) => update("priceNGN", parseInt(e.target.value) || 0)}
              className="w-full bg-transparent border-b border-line py-2 outline-none focus:border-ink font-mono-tight text-xl"
            />
          </Field>
          <Field label="Category">
            <select
              value={state.categoryId ?? ""}
              onChange={(e) => update("categoryId", e.target.value || null)}
              className="w-full bg-transparent border border-line py-2 px-3 outline-none focus:border-ink"
            >
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
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
            {pending ? "Saving…" : initial.id ? "Save changes" : "Create product"}
          </button>
          {initial.id && deleteAction && (
            <button
              type="button"
              onClick={onDelete}
              disabled={pending}
              className="w-full border border-line py-3 font-mono-tight text-ink/55 hover:border-vermillion hover:text-vermillion disabled:opacity-50"
            >
              Delete product
            </button>
          )}
        </div>
      </aside>
    </form>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <header className="border-b border-line pb-2">
        <h2 className="font-display text-2xl tracking-tight">{title}</h2>
        {hint && <p className="font-mono-tight text-ink/55">{hint}</p>}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
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

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="font-mono-tight text-ink/55 text-left px-3 py-2 font-normal">{children}</th>;
}
function Td({ children }: { children?: React.ReactNode }) {
  return <td className="px-3 py-2">{children}</td>;
}
