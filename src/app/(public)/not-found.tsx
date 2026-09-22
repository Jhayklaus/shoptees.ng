import Link from "next/link";

// This route streams behind the public layout, so Next has already flushed
// the response headers by the time notFound() renders — the body is the 404
// page but the status is 200. Until that is addressed, noindex is what stops
// a missing or draft URL being indexed as a real page.
export const metadata = { robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-5 md:px-10 py-28 md:py-36 text-center">
      <p className="font-label text-muted">Error 404</p>
      <h1 className="font-display text-[clamp(2.2rem,7vw,4rem)] mt-3">
        That page slipped behind the cutting table
      </h1>
      <p className="text-ink-soft mt-4 text-[0.95rem]">
        The link may be out of date, or the piece may have come off the site.
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Link href="/shop" className="btn press">
          Browse the shop
        </Link>
        <Link href="/" className="btn btn-ghost press">
          Home
        </Link>
      </div>
    </main>
  );
}
