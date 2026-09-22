import Link from "next/link";

/**
 * Section header for a shop page: a small label and a "View all" link.
 *
 * Deliberately quiet. Every section on this site used to open with a stamp
 * eyebrow and a display headline at 3.6rem, which meant "New in" and "Shop by
 * category" shouted as loudly as the brand itself and the page read as a
 * stack of posters. On a storefront these are signposts — the customer is
 * scanning for product, not reading chapter titles. The serif headline is
 * reserved for blocks that sit on an image.
 */
export function SectionHead({
  title,
  href,
  linkLabel = "View all",
  count,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  count?: number;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 mb-5">
      <h2 className="font-section">
        {title}
        {count != null && (
          <span className="font-label text-muted ml-2.5 tnum">
            {String(count).padStart(2, "0")}
          </span>
        )}
      </h2>
      {href && (
        <Link
          href={href}
          className="font-label text-muted hover:text-ink transition-colors whitespace-nowrap shrink-0"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}
