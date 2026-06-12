import Link from "next/link";

const items = ["NEW DROP JUST LANDED", "■", "SHOP THE LATEST", "■", "LAGOS → EVERYWHERE", "■"];

// Hazard-orange marquee strip between sections. The whole band links
// through to the shop.
export function DropMarquee() {
  // Repeat enough content for the seamless -50% translate loop.
  const reel = Array.from({ length: 8 }).flatMap(() => items);

  return (
    <Link
      href="/shop"
      aria-label="Shop the latest drop"
      className="group block bg-vermillion text-paper py-3.5 md:py-5 overflow-hidden my-16 md:my-24 border-y-[3px] border-ink hover:bg-ink transition-colors duration-200"
    >
      <div className="flex animate-marquee whitespace-nowrap will-change-transform">
        {reel.map((t, i) => (
          <span
            key={i}
            className={[
              "font-condensed text-2xl md:text-4xl px-5 inline-flex items-center",
              t === "■" ? "text-ink group-hover:text-vermillion transition-colors duration-200" : "",
            ].join(" ")}
          >
            {t}
          </span>
        ))}
      </div>
    </Link>
  );
}
