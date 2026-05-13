import { getAllSettings } from "@/lib/server/settings";
import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getAllSettings();

  return (
    <>
      <PageHeader eyebrow="House" title="Settings" accent="the basics." />
      <div className="px-8 py-8 space-y-10">
        <section>
          <h2 className="font-mono-tight text-ink/55 mb-3">Storefront</h2>
          <SettingsForm initial={settings} />
        </section>

        <section className="border-t border-line pt-8">
          <h2 className="font-mono-tight text-ink/55 mb-3">Order numbering</h2>
          <p className="font-italic-accent text-ink-soft">
            Next order number will be{" "}
            <span className="font-mono-tight text-ink">
              SHP-{settings["order.year"]}-
              {String(parseInt(settings["order.counter"], 10) + 1).padStart(4, "0")}
            </span>
            . Counter resets each calendar year.
          </p>
        </section>
      </div>
    </>
  );
}
