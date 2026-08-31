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

const NOTIFICATION_FIELDS = [
  {
    key: "notifications.admin_email",
    label: "New-order admin email",
    type: "email",
    hint: "Where new paid-order notifications are sent. Leave blank to disable.",
  },
] as const;

const HERO_FIELDS = [
  { key: "hero.eyebrow", label: "Eyebrow", hint: 'Small label above the headline. e.g. "Spring/Summer · Lagos".' },
  { key: "hero.headline", label: "Headline", hint: "Main display headline. Use line breaks for each line.", multiline: true },
  { key: "hero.cycle_words", label: "Cycling words", hint: "Comma-separated. They animate one after another at the end of the headline. Leave blank for none." },
  { key: "hero.body", label: "Body", hint: "Short paragraph in the right column.", multiline: true },
  { key: "hero.cta_label", label: "Button label", hint: 'e.g. "Shop the collection".' },
  { key: "hero.cta_href", label: "Button link", hint: "Path or full URL." },
  { key: "hero.caption", label: "Image caption", hint: "Small caption overlaid on the hero image." },
] as const;

const CAMPAIGN_FIELDS = [
  { key: "campaign.headline", label: "Headline" },
  { key: "campaign.subcopy", label: "Sub-copy", hint: "One short line.", multiline: true },
  { key: "campaign.cta_label", label: "Button label", hint: 'e.g. "Shop the drop".' },
  { key: "campaign.cta_href", label: "Button link", hint: "Path or full URL." },
] as const;

const ROUNDING_OPTIONS = [
  { value: "charm", label: "Charm — $27.99" },
  { value: "whole", label: "Whole dollars — $28" },
  { value: "exact", label: "Exact conversion — $27.43" },
] as const;

const ALL_KEYS = [
  ...STOREFRONT_FIELDS.map((f) => f.key),
  ...NOTIFICATION_FIELDS.map((f) => f.key),
  ...HERO_FIELDS.map((f) => f.key),
  ...CAMPAIGN_FIELDS.map((f) => f.key),
  "hero.image_url",
  "hero.image_alt",
  "campaign.enabled",
  "campaign.image_url",
  "campaign.image_alt",
  "currency.usd_enabled",
  "currency.ngn_per_usd",
  "currency.usd_rounding",
  "currency.charge_in_usd",
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

  const campaignOn = values["campaign.enabled"] === "true";
  const usdOn = values["currency.usd_enabled"] === "true";
  const rate = Number(values["currency.ngn_per_usd"]);
  const rateValid = Number.isFinite(rate) && rate > 0;

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

      {/* ── Notifications ────────────────────────────────────────────── */}
      <section className="space-y-5">
        <header className="border-b border-line pb-2">
          <h3 className="font-display text-2xl tracking-tight">Notifications</h3>
        </header>
        {NOTIFICATION_FIELDS.map((f) => (
          <Field
            key={f.key}
            id={f.key}
            label={f.label}
            hint={"hint" in f ? f.hint : undefined}
            value={values[f.key]}
            onChange={(v) => set(f.key, v)}
            type={"type" in f ? f.type : undefined}
          />
        ))}
      </section>

      {/* ── Currency ─────────────────────────────────────────────────── */}
      <section className="space-y-5">
        <header className="border-b border-line pb-2 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl tracking-tight">Currency</h3>
            <p className="font-italic-accent text-ink/55">
              Products are always priced in naira. Turning this on shows a ₦ / $
              switcher in the header and converts every price at the rate below.
              Visitors outside Nigeria see dollars by default.
            </p>
          </div>
          <Toggle
            checked={usdOn}
            onChange={(v) => set("currency.usd_enabled", v ? "true" : "false")}
            label="USD on"
          />
        </header>

        <div className={usdOn ? "space-y-5" : "space-y-5 opacity-60 pointer-events-none"}>
          <Field
            id="currency.ngn_per_usd"
            label="Naira per US dollar"
            hint="Your rate, not the market's — build in whatever buffer you want. Update it when the naira moves."
            value={values["currency.ngn_per_usd"]}
            onChange={(v) => set("currency.ngn_per_usd", v)}
          />
          {usdOn && !rateValid && (
            <p className="bg-vermillion/10 border-l-2 border-vermillion px-3 py-2 font-mono-tight text-ink-soft">
              Enter a rate greater than zero, or dollar prices stay switched off.
            </p>
          )}

          <div>
            <label htmlFor="currency.usd_rounding" className="block font-mono-tight text-ink/55 mb-1">
              Price rounding
            </label>
            <select
              id="currency.usd_rounding"
              value={values["currency.usd_rounding"] || "charm"}
              onChange={(e) => set("currency.usd_rounding", e.target.value)}
              className="w-full border-2 border-line focus:border-vermillion outline-none px-3 py-2 font-display text-lg bg-paper"
            >
              {ROUNDING_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <p className="font-italic-accent text-ink/55 mt-1">
              How converted prices land. {rateValid ? previewPrice(rate, values["currency.usd_rounding"]) : ""}
            </p>
          </div>

          <div className="border-2 border-line p-4 flex items-start justify-between gap-4">
            <div>
              <p className="font-display text-lg">Charge cards in USD</p>
              <p className="font-italic-accent text-ink/55">
                Off: customers see dollars but Paystack charges the naira
                equivalent and their bank converts. Only turn this on once
                Paystack has USD enabled on your business and a domiciliary
                account to settle into — otherwise payments will fail.
              </p>
            </div>
            <Toggle
              checked={values["currency.charge_in_usd"] === "true"}
              onChange={(v) => set("currency.charge_in_usd", v ? "true" : "false")}
              label="USD charge"
            />
          </div>
        </div>
      </section>

      {/* ── Homepage hero ────────────────────────────────────────────── */}
      <section className="space-y-5">
        <header className="border-b border-line pb-2">
          <h3 className="font-display text-2xl tracking-tight">Homepage hero</h3>
          <p className="font-italic-accent text-ink/55">
            The top of the homepage — headline, copy, call-to-action and banner image.
          </p>
        </header>

        <SingleImagePicker
          label="Hero image"
          value={values["hero.image_url"]}
          onChange={(url) => set("hero.image_url", url)}
          altValue={values["hero.image_alt"]}
          onAltChange={(alt) => set("hero.image_alt", alt)}
        />

        <div className="space-y-5">
          {HERO_FIELDS.map((f) => (
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
      </section>

      {/* ── Campaign banner ──────────────────────────────────────────── */}
      <section className="space-y-5">
        <header className="border-b border-line pb-2 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl tracking-tight">Campaign banner</h3>
            <p className="font-italic-accent text-ink/55">
              Full-bleed image with overlaid headline, directly under the hero. Toggle off to hide it.
            </p>
          </div>
          <Toggle
            checked={campaignOn}
            onChange={(v) => set("campaign.enabled", v ? "true" : "false")}
            label="Enabled"
          />
        </header>

        <div className={campaignOn ? "" : "opacity-60 pointer-events-none"}>
          <SingleImagePicker
            label="Campaign image"
            value={values["campaign.image_url"]}
            onChange={(url) => set("campaign.image_url", url)}
            altValue={values["campaign.image_alt"]}
            onAltChange={(alt) => set("campaign.image_alt", alt)}
          />

          <div className="mt-6 space-y-5">
            {CAMPAIGN_FIELDS.map((f) => (
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
        "relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0",
        checked ? "bg-vermillion" : "bg-line",
      ].join(" ")}
    >
      <span
        className={[
          "absolute top-0.5 left-0.5 w-5 h-5 bg-paper rounded-full shadow-sm transition-transform duration-200",
          checked ? "translate-x-5" : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );
}

// Shows the admin what a real product price becomes under the current rule.
function previewPrice(rate: number, rounding: string): string {
  const sample = 45000;
  const raw = sample / rate;
  const out =
    rounding === "whole"
      ? Math.ceil(raw)
      : rounding === "exact"
        ? Math.round(raw * 100) / 100
        : Math.max(0.99, Math.ceil(raw) - 0.01);
  return `A ₦${sample.toLocaleString()} product shows as $${out.toFixed(2)}.`;
}
