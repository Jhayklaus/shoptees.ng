import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getAllSettings } from "@/lib/server/settings";

// Full-bleed campaign banner that sits directly under the hero. A single big
// edge-to-edge image with an overlaid headline + CTA — admin-managed via the
// `campaign.*` settings. Hidden unless enabled and an image is set.
export async function CampaignBanner() {
  const s = await getAllSettings();
  if (s["campaign.enabled"] !== "true" || !s["campaign.image_url"]) return null;

  const headline = s["campaign.headline"];
  const subcopy = s["campaign.subcopy"];
  const ctaLabel = s["campaign.cta_label"];
  const ctaHref = s["campaign.cta_href"] || "/shop";
  const imageAlt = s["campaign.image_alt"] || headline || "Shoptees campaign";

  return (
    <section className="relative w-full mt-12 md:mt-16">
      <div className="relative w-full aspect-[4/5] sm:aspect-[16/10] lg:aspect-[16/7] overflow-hidden bg-paper-deep group">
        <Image
          src={s["campaign.image_url"]}
          alt={imageAlt}
          fill
          sizes="100vw"
          className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.03]"
        />

        {/* Legibility scrim — bottom-anchored so overlaid copy stays readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />

        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-[1400px] px-5 md:px-10 pb-8 md:pb-14">
            <div className="max-w-2xl text-paper">
              {headline && (
                <h2 className="font-display text-5xl md:text-7xl xl:text-8xl leading-[0.9] tracking-[-0.03em]">
                  {headline}
                </h2>
              )}
              {subcopy && (
                <p className="mt-4 font-italic-accent text-lg md:text-2xl text-paper/85 max-w-lg">
                  {subcopy}
                </p>
              )}
              {ctaLabel && (
                <Link
                  href={ctaHref}
                  className="mt-7 inline-flex items-center gap-2 group/cta bg-paper text-ink px-6 py-3 font-mono-tight hover:bg-vermillion hover:text-paper transition-colors"
                >
                  {ctaLabel}
                  <ArrowUpRight
                    size={16}
                    className="transition-transform group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
                  />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Vermillion corner ticks to match the rest of the site */}
        <span className="absolute top-0 left-0 w-8 h-px bg-vermillion z-10" />
        <span className="absolute top-0 left-0 w-px h-8 bg-vermillion z-10" />
        <span className="absolute bottom-0 right-0 w-8 h-px bg-vermillion z-10" />
        <span className="absolute bottom-0 right-0 w-px h-8 bg-vermillion z-10" />
      </div>
    </section>
  );
}
