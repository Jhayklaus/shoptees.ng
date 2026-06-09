import Link from "next/link";

const items = ["NEW DROP JUST LANDED", "✦", "SHOP THE LATEST", "✦"];

// High-energy vermillion marquee strip between sections. The whole band
// links through to the shop.
export function DropMarquee() {
  // Repeat enough content for the seamless -50% translate loop.
  const reel = Array.from({ length: 10 }).flatMap(() => items);

  return (
    <Link
      href="/shop"
      aria-label="Shop the latest drop"
      className="group block bg-vermillion text-paper py-3 md:py-4 overflow-hidden my-16 md:my-24 hover:bg-ink transition-colors duration-300"
    >
      <div className="flex animate-marquee whitespace-nowrap will-change-transform">
        {reel.map((t, i) => (
          <span
            key={i}
            className="font-display text-xl md:text-2xl tracking-tight px-5 inline-flex items-center"
          >
            {t}
          </span>
        ))}
      </div>
    </Link>
  );
}
