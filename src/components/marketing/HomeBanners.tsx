import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { listEnabledBanners } from "@/lib/server/banners";

// Renders every enabled homepage banner, in order. Content is fully managed
// from /admin/banners. Each banner alternates its image side per its `layout`
// field so a stack of them reads like a magazine spread.
export async function HomeBanners() {
  const banners = await listEnabledBanners();
  if (banners.length === 0) return null;

  return (
    <div className="divide-y divide-line">
      {banners.map((b, idx) => {
        // Auto-alternate: even index → image left, odd → image right.
        // Ignores the stored layout field so a stack of banners always zig-zags.
        const imageRight = idx % 2 !== 0;
        const ctaHref = b.ctaHref || "/shop";
        const imageAlt = b.imageAlt || b.title || "Shoptees";

        return (
          <section key={b.id} className="mx-auto max-w-[1400px] px-5 md:px-10 py-16 md:py-24">
            <div className="relative grid grid-cols-12 bg-ink text-paper overflow-hidden border-[3px] border-ink">
              {/* Image side */}
              {b.imageUrl && (
                <div
                  className={[
                    "col-span-12 md:col-span-7 relative aspect-[4/3] md:aspect-auto md:min-h-[480px] group",
                    imageRight ? "order-2" : "order-2 md:order-1",
                  ].join(" ")}
                >
                  <Image
                    src={b.imageUrl}
                    alt={imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 60vw"
                    className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
                  />
                  <span className="absolute top-3 left-3 w-7 h-[3px] bg-tan" />
                  <span className="absolute top-3 left-3 w-[3px] h-7 bg-tan" />
                </div>
              )}

              {/* Copy side */}
              <div
                className={[
                  "relative flex flex-col justify-between p-8 md:p-12 order-1",
                  imageRight ? "md:order-1" : "md:order-2",
                  b.imageUrl ? "col-span-12 md:col-span-5" : "col-span-12",
                ].join(" ")}
              >
                <span className="absolute top-0 right-0 w-1.5 h-16 bg-tan" />

                <div>
                  {b.eyebrow && (
                    <span className="stamp text-paper/70">{b.eyebrow}</span>
                  )}
                  <h2 className="mt-4 font-display text-4xl md:text-5xl xl:text-6xl leading-[0.95]">
                    {b.title}
                  </h2>
                  {b.body && (
                    <p className="mt-5 text-paper/75 text-base md:text-lg leading-snug max-w-md">
                      {b.body}
                    </p>
                  )}
                </div>

                {b.ctaLabel && (
                  <div className="mt-8">
                    <Link
                      href={ctaHref}
                      className="btn-wipe btn-wipe-hazard inline-flex items-center gap-2 group bg-paper text-ink px-5 py-3 font-condensed text-[0.78rem] hover:text-paper transition-colors duration-200"
                    >
                      {b.ctaLabel}
                      <ArrowUpRight
                        size={14}
                        className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
