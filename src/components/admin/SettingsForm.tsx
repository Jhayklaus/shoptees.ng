"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveSettingsAction } from "@/app/admin/(authed)/settings/actions";
import { SingleImagePicker } from "@/components/admin/SingleImagePicker";

const STOREFRONT_FIELDS = [
  { key: "site.name", label: "Brand name" },
  { key: "site.tagline", label: "Tagline", hint: "Used in metadata + announcement bar.", multiline: true },
  { key: "contact.email", label: "Customer-facing email", type: "email" },
  { key: "contact.phone", label: "WhatsApp / phone", type: "tel" },
] as const;

const BANNER_FIELDS = [
  { key: "banner.eyebrow", label: "Eyebrow", hint: 'Small label above the headline. e.g. "New arrival · 02".' },
  { key: "banner.title", label: "Headline" },
  { key: "banner.body", label: "Body", hint: "One short paragraph.", multiline: true },
  { key: "banner.cta_label", label: "Button label", hint: 'e.g. "Shop the drop".' },
  { key: "banner.cta_href", label: "Button link", hint: "Path or full URL." },
] as const;

const ALL_KEYS = [
  ...STOREFRONT_FIELDS.map((f) => f.key),
  ...BANNER_FIELDS.map((f) => f.key),
  "banner.enabled",
  "banner.image_url",
  "banner.image_alt",
] as const;

type AnyKey = (typeof ALL_KEYS)[number];

export function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<AnyKey, string>>(() => {
    const seeded = {} as Record<AnyKey, string>;
    for (const k of ALL_KEYS) seeded[k] = initial[k] ?? "";
    return seeded;
  });
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends AnyKey>(k: K, v: string) =>
    setValues((s) => ({ ...s, [k]: v }));

  const bannerOn = values["banner.enabled"] === "true";

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await saveSettingsAction(values);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSavedAt(Date.now());
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-12">
      {/* ── Storefront ───────────────────────────────────────────────── */}
      <section className="space-y-5">
        <header className="border-b border-line pb-2">
          <h3 className="font-display text-2xl tracking-tight">Storefront</h3>
        </header>
        {STOREFRONT_FIELDS.map((f) => (
          <Field
            key={f.key}
            id={f.key}
            label={f.label}
            hint={"hint" in f ? f.hint : undefined}
            value={values[f.key]}
            onChange={(v) => set(f.key, v)}
            type={"type" in f ? f.type : undefined}
            multiline={"multiline" in f ? f.multiline : false}
          />
        ))}
      </section>

      {/* ── Homepage banner ──────────────────────────────────────────── */}
      <section className="space-y-5">
        <header className="border-b border-line pb-2 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl tracking-tight">Homepage banner</h3>
            <p className="font-italic-accent text-ink/55">
              Sits below the featured grid. Toggle off to hide it without losing the content.
            </p>
          </div>
          <Toggle
            checked={bannerOn}
            onChange={(v) => set("banner.enabled", v ? "true" : "false")}
            label="Enabled"
          />
        </header>

        <div className={bannerOn ? "" : "opacity-60 pointer-events-none"}>
          <SingleImagePicker
            label="Banner image"
            value={values["banner.image_url"]}
            onChange={(url) => set("banner.image_url", url)}
            altValue={values["banner.image_alt"]}
            onAltChange={(alt) => set("banner.image_alt", alt)}
          />

          <div className="mt-6 space-y-5">
            {BANNER_FIELDS.map((f) => (
              <Field
                key={f.key}
                id={f.key}
                label={f.label}
                hint={"hint" in f ? f.hint : undefined}
                value={values[f.key]}
                onChange={(v) => set(f.key, v)}
                multiline={"multiline" in f ? f.multiline : false}
              />
            ))}
          </div>
        </div>
      </section>

      {error && (
        <p className="bg-vermillion/10 border-l-2 border-vermillion px-3 py-2 font-mono-tight text-ink-soft">
          {error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="bg-ink text-paper px-6 py-3 font-mono-tight hover:bg-vermillion transition-colors disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save settings"}
        </button>
        {savedAt && !pending && (
          <p className="font-italic-accent text-ink/55">Saved.</p>
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
  type = "text",
  multiline = false,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
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
          type={type}
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
