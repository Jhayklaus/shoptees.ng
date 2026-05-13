import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getAllSettings } from "@/lib/server/settings";

export async function AnnouncementBanner() {
  const s = await getAllSettings();
  if (s["banner.enabled"] !== "true") return null;

  const eyebrow = s["banner.eyebrow"];
  const title = s["banner.title"];
  const body = s["banner.body"];
  const ctaLabel = s["banner.cta_label"];
  const ctaHref = s["banner.cta_href"] || "/shop";
  const imageUrl = s["banner.image_url"];
  const imageAlt = s["banner.image_alt"] || title || "Shoptees announcement";

  return (
    <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-24">
      <div className="relative grid grid-cols-12 bg-ink text-paper overflow-hidden">
        {/* Image side */}
        {imageUrl && (
          <div className="col-span-12 md:col-span-7 relative aspect-[4/3] md:aspect-auto md:min-h-[480px] order-2 md:order-1 group">
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
            />
            {/* Subtle vermillion frame ticks at the inner corner */}
            <span className="absolute top-3 left-3 w-6 h-px bg-vermillion" />
            <span className="absolute top-3 left-3 w-px h-6 bg-vermillion" />
          </div>
        )}

        {/* Copy side */}
        <div
          className={[
            "relative flex flex-col justify-between p-8 md:p-12 order-1 md:order-2",
            imageUrl ? "col-span-12 md:col-span-5" : "col-span-12",
          ].join(" ")}
        >
          {/* Diagonal vermillion bar — anchors the announcement visually */}
          <span className="absolute top-0 right-0 w-1 h-16 bg-vermillion" />

          <div>
            <p className="font-mono-tight text-paper/55">{eyebrow}</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl xl:text-6xl leading-[0.95] tracking-[-0.02em]">
              {title.split(",").map((part, i, arr) => (
                <span key={i}>
                  {i > 0 && <span className="font-italic-accent text-vermillion">,</span>}
                  {i === arr.length - 1 && arr.length > 1 ? (
                    <span className="font-italic-accent">{part}</span>
                  ) : (
                    part
                  )}
                </span>
              ))}
            </h2>
            <p className="mt-5 font-italic-accent text-paper/75 text-lg leading-snug max-w-md">
              {body}
            </p>
          </div>

          <div className="mt-8">
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 group bg-paper text-ink px-5 py-3 font-mono-tight hover:bg-vermillion hover:text-paper transition-colors"
            >
              {ctaLabel}
              <ArrowUpRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
