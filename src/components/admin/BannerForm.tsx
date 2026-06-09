"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { SingleImagePicker } from "@/components/admin/SingleImagePicker";
import { saveBannerAction, deleteBannerAction } from "@/app/admin/(authed)/banners/actions";
import { BANNER_LAYOUTS, type BannerLayout } from "@/lib/server/banners";

export type BannerFormValues = {
  id?: string;
  enabled: boolean;
  sortOrder: number;
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
  imageAlt: string;
  layout: BannerLayout;
};

export function BannerForm({ initial }: { initial: BannerFormValues }) {
  const router = useRouter();
  const [v, setV] = useState<BannerFormValues>(initial);
  const [pending, startTransition] = useTransition();
  const [deleting, startDelete] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof BannerFormValues>(k: K, val: BannerFormValues[K]) =>
    setV((s) => ({ ...s, [k]: val }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await saveBannerAction(v);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/admin/banners");
      router.refresh();
    });
  };

  const onDelete = () => {
    if (!v.id) return;
    if (!confirm("Delete this banner? This cannot be undone.")) return;
    startDelete(async () => {
      const res = await deleteBannerAction(v.id!);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/admin/banners");
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-10 px-8 py-8">
      <section className="space-y-5">
        <header className="border-b border-line pb-2 flex items-center justify-between gap-4">
          <h3 className="font-display text-2xl tracking-tight">Banner</h3>
          <Toggle
            checked={v.enabled}
            onChange={(c) => set("enabled", c)}
            label="Enabled"
          />
        </header>

        <SingleImagePicker
          label="Banner image"
          value={v.imageUrl}
          onChange={(url) => set("imageUrl", url)}
          altValue={v.imageAlt}
          onAltChange={(alt) => set("imageAlt", alt)}
        />

        <Field id="eyebrow" label="Eyebrow" hint='Small label above the headline. e.g. "New arrival · 02".'
          value={v.eyebrow} onChange={(x) => set("eyebrow", x)} />
        <Field id="title" label="Headline" value={v.title} onChange={(x) => set("title", x)} />
        <Field id="body" label="Body" hint="One short paragraph." multiline
          value={v.body} onChange={(x) => set("body", x)} />
        <Field id="ctaLabel" label="Button label" hint='e.g. "Shop the drop". Leave blank to hide the button.'
          value={v.ctaLabel} onChange={(x) => set("ctaLabel", x)} />
        <Field id="ctaHref" label="Button link" hint="Path or full URL."
          value={v.ctaHref} onChange={(x) => set("ctaHref", x)} />

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label htmlFor="layout" className="font-mono-tight text-ink/55 block">
              Image side
            </label>
            <select
              id="layout"
              value={v.layout}
              onChange={(e) => set("layout", e.target.value as BannerLayout)}
              className="mt-1 w-full bg-transparent border-b border-line py-2 outline-none focus:border-ink font-display text-lg"
            >
              {BANNER_LAYOUTS.map((l) => (
                <option key={l} value={l}>
                  {l === "imageLeft" ? "Image left" : "Image right"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sortOrder" className="font-mono-tight text-ink/55 block">
              Sort order
              <span className="text-ink/40 normal-case ml-2">Lower shows first.</span>
            </label>
            <input
              id="sortOrder"
              type="number"
              value={v.sortOrder}
              onChange={(e) => set("sortOrder", parseInt(e.target.value, 10) || 0)}
              className="mt-1 w-full bg-transparent border-b border-line py-2 outline-none focus:border-ink font-display text-lg"
            />
          </div>
        </div>
      </section>

      {error && (
        <p className="bg-vermillion/10 border-l-2 border-vermillion px-3 py-2 font-mono-tight text-ink-soft">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-4">
        <button
          type="submit"
          disabled={pending}
          className="bg-ink text-paper px-6 py-3 font-mono-tight hover:bg-vermillion transition-colors disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save banner"}
        </button>

        {v.id && (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 font-mono-tight text-ink/55 hover:text-vermillion transition-colors disabled:opacity-50"
          >
            <Trash2 size={14} />
            {deleting ? "Deleting…" : "Delete"}
          </button>
        )}
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  hint,
  value,
  onChange,
  multiline = false,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="font-mono-tight text-ink/55 block">
        {label}
        {hint && <span className="text-ink/40 normal-case ml-2">{hint}</span>}
      </label>
      {multiline ? (
        <textarea
          id={id}
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full bg-transparent border border-line p-3 outline-none focus:border-ink resize-none font-display text-lg"
        />
      ) : (
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full bg-transparent border-b border-line py-2 outline-none focus:border-ink font-display text-lg"
        />
      )}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={[
        "relative w-11 h-6 rounded-full transition-colors shrink-0",
        checked ? "bg-vermillion" : "bg-line",
      ].join(" ")}
    >
      <span
        className={[
          "absolute top-0.5 w-5 h-5 bg-paper rounded-full transition-transform shadow-sm",
          checked ? "translate-x-5" : "translate-x-0.5",
        ].join(" ")}
      />
    </button>
  );
}
