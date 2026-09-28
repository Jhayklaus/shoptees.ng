import { getAllSettings } from "@/lib/server/settings";
import { listAdminCollections } from "@/lib/server/collections";
import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [settings, collections] = await Promise.all([
    getAllSettings(),
    listAdminCollections(),
  ]);

  // Drafts are included so the picker can show them greyed rather than
  // hiding them — an editor who cannot find their collection in the list
  // has no way to tell it is because it is unpublished.
  const collectionOptions = collections.map((c) => ({
    slug: c.slug,
    name: c.name,
    published: c.status === "ACTIVE",
  }));

  return (
    <>
      <PageHeader eyebrow="House" title="Settings" accent="the basics." />
      <div className="px-8 py-8 space-y-10">
        <section>
          <h2 className="font-label text-ink/55 mb-3">Storefront</h2>
          <SettingsForm initial={settings} collections={collectionOptions} />
        </section>

        <section className="border-t border-line pt-8">
          <h2 className="font-label text-ink/55 mb-3">Order numbering</h2>
          <p className="font-italic-accent text-ink-soft">
            Next order number will be{" "}
            <span className="font-label text-ink">
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
