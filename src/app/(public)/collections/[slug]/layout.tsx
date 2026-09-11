import { notFound } from "next/navigation";
import { getCollectionBySlug } from "@/lib/server/collections";

// See the note in shop/[slug]/layout.tsx — guarding here rather than in the
// page is what keeps a missing or draft collection a real HTTP 404 now that
// the segment streams behind a loading.tsx skeleton.
export default async function CollectionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection || collection.status !== "ACTIVE") notFound();
  return <>{children}</>;
}
