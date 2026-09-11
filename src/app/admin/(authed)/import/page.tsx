import { PageHeader } from "@/components/admin/PageHeader";
import { ImportArchivePanel } from "@/components/admin/ImportArchivePanel";
import { ARCHIVE_DESIGNS } from "@/lib/archive-catalogue";

export const dynamic = "force-dynamic";

export default function ImportPage() {
  const colourways = ARCHIVE_DESIGNS.reduce((n, d) => n + d.colourways.length, 0);
  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Import archive"
        accent="the whole line."
      />
      <ImportArchivePanel designs={ARCHIVE_DESIGNS.length} colourways={colourways} />
    </>
  );
}
