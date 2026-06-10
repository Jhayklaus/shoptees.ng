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
  if (!collection) {
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
  if (!collection) notFound();

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const { products, total } = await getCollectionProductsPage(slug, page, PER_PAGE);
  const display = products.map(toDisplayProduct);
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <main className="mx-auto max-w-[1400px] px-5 md:px-10 pt-8 pb-24">
      <p className="font-mono-tight text-ink/55 mb-5">
        <Link href="/collections" className="hover:text-vermillion">
          Collections
        </Link>{" "}
        / {collection.name}
      </p>

      <CollectionBanner
        variant="page"
        name={collection.name}
        slug={collection.slug}
        description={collection.description}
        imageUrl={collection.imageUrl}
        imageAlt={collection.imageAlt}
        count={total}
      />

      <div className="mt-12">
        {display.length === 0 ? (
          <div className="border border-dashed border-line p-16 text-center">
            <p className="font-italic-accent text-2xl text-ink/55">
              Nothing in {collection.name.toLowerCase()} right now.
            </p>
            <Link
              href="/shop"
              className="inline-block mt-4 font-mono-tight text-ink underline-offset-4 hover:underline"
            >
              See everything →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-14">
            {display.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="mt-16 flex items-center justify-center gap-6 border-t border-line pt-8"
        >
          <PageLink
            href={`/collections/${slug}?page=${page - 1}`}
            disabled={page <= 1}
            label="Previous page"
          >
            <ChevronLeft size={16} />
          </PageLink>
          <p className="font-mono-tight text-ink/70">
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
  if (disabled) {
    return (
      <span className="flex h-10 w-10 items-center justify-center border border-line text-ink/25">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center border border-line hover:border-ink hover:text-vermillion transition-colors"
    >
      {children}
    </Link>
  );
}
