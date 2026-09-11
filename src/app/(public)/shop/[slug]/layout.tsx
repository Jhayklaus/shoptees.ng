import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/server/products";

// The existence check lives in the layout, not the page.
//
// `loading.tsx` wraps the page in a Suspense boundary, and Next flushes the
// shell — headers included — as soon as that boundary is reached. A
// notFound() raised inside the page therefore renders the 404 body under an
// HTTP 200, which is a soft 404: Google indexes the URL as a real page. The
// layout renders before the boundary, so a notFound() here still sets the
// status. getProductBySlug is React-cached, so the page's own lookup reuses
// this query rather than doubling it.
export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || product.status !== "ACTIVE") notFound();
  return <>{children}</>;
}
