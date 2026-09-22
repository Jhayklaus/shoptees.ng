import Link from "next/link";

/**
 * Contents page for the archive — every collection, numbered, with its own
 * count, straight under the hero.
 *
 * This replaces the "scroll and hope" model the homepage had, where the only
 * way to see what lines exist was to open a nav dropdown. The numbering is
 * real information here: it is the archive's own ordering (by size, previous
 * season last), not decorative 01/02/03 stamped on three feature boxes.
 */
export function CollectionIndex({
  collections,
}: {
  collections: { slug: string; name: string; count: number }[];
}) {
  if (collections.length === 0) return null;

  return (
    <nav aria-label="Collections" className="border-b-2 border-ink">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap">
          {collections.map((c, i) => (
            <li
              key={c.slug}
              className="lg:flex-1 border-line [&:not(:last-child)]:border-r border-b lg:border-b-0"
            >
              <Link
                href={`/collections/${c.slug}`}
                className="group block py-4 pr-4 lg:pr-5 h-full"
              >
                <p className="font-label text-muted tnum">
                  {String(i + 1).padStart(2, "0")} / {String(c.count).padStart(2, "0")}{" "}
                  {c.count === 1 ? "piece" : "pieces"}
                </p>
                <p className="font-sub text-[0.95rem] mt-1.5 group-hover:text-vermillion transition-colors">
                  {c.name}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
