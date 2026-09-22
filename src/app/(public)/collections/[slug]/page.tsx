import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import {
  getCollectionBySlug,
  getCollectionProductsPage,
} from "@/lib/server/collections";
import { toDisplayProduct } from "@/lib/server/products";
import { ProductCard } from "@/components/product/ProductCard";
import { CollectionBanner } from "@/components/collection/CollectionBanner";

const PER_PAGE = 12;

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ page?: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  // Drafts must not leak their name through the page title.
  if (!collection || collection.status !== "ACTIVE") {
    return buildMetadata({ title: "Collections", description: "", path: "/collections" });
  }
  return buildMetadata({
    title: `${collection.name} — Collection`,
    description:
      collection.description ||
      `Shop the ${collection.name} collection from Shoptees. Streetwear and football apparel for men and women.`,
    path: `/collections/${collection.slug}`,
  });
}

export const dynamic = "force-dynamic";

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const [{ slug }, { page: pageParam }] = await Promise.all([params, searchParams]);

  const collection = await getCollectionBySlug(slug);
  // A draft collection has no public page — the admin can still reach it
  // through /admin/collections while it is being put together.
  if (!collection || collection.status !== "ACTIVE") notFound();

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const { products, total } = await getCollectionProductsPage(slug, page, PER_PAGE);
  const display = products.map(toDisplayProduct);
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <main className="mx-auto max-w-[1400px] px-5 md:px-10 pt-6 pb-24">
      <nav aria-label="Breadcrumb" className="font-label text-muted mb-5">
        <Link href="/collections" className="hover:text-ink transition-colors">
          Collections
        </Link>
        {" / "}
        <span className="text-ink">{collection.name}</span>
      </nav>

      <CollectionBanner
        name={collection.name}
        slug={collection.slug}
        description={collection.description}
        imageUrl={collection.imageUrl}
        imageAlt={collection.imageAlt}
        count={total}
      />

      <div className="mt-10 md:mt-12">
        {display.length === 0 ? (
          <div className="border border-dashed border-line-2 p-16 text-center">
            <p className="font-label text-muted">
              Nothing in {collection.name.toLowerCase()} right now
            </p>
            <p className="mt-5">
              <Link href="/shop" className="font-label underline underline-offset-4">
                See everything →
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-10 md:gap-x-6 md:gap-y-12">
            {display.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="mt-14 flex items-center justify-center gap-6 border-t border-line pt-8"
        >
          <PageLink
            href={`/collections/${slug}?page=${page - 1}`}
            disabled={page <= 1}
            label="Previous page"
          >
            <ChevronLeft size={16} />
          </PageLink>
          <p className="font-label text-muted tnum">
            Page {Math.min(page, totalPages)} of {totalPages}
          </p>
          <PageLink
            href={`/collections/${slug}?page=${page + 1}`}
            disabled={page >= totalPages}
            label="Next page"
          >
            <ChevronRight size={16} />
          </PageLink>
        </nav>
      )}
    </main>
  );
}

/**
 * Pagination arrow. A disabled page renders as a span, not a dead link —
 * a link that goes nowhere is still focusable and still announced as a
 * link, which is a worse experience than not having it.
 */
function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const shape =
    "inline-flex items-center justify-center w-11 h-11 border transition-colors";
  if (disabled) {
    return (
      <span aria-hidden className={`${shape} border-line text-muted opacity-40`}>
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={label}
      className={`${shape} border-line-2 text-ink hover:border-ink hover:bg-ink hover:text-paper`}
    >
      {children}
    </Link>
  );
}
