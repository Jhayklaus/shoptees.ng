import { FeatureBanner } from "@/components/marketing/FeatureBanner";
import { listEnabledBanners } from "@/lib/server/banners";

/**
 * Every enabled homepage banner, in order. Content is fully managed from
 * /admin/banners.
 *
 * These used to render in their own format — a bordered split grid with tan
 * corner brackets and a filled button — which meant the surface an editor
 * actually controls was the one surface that did not look like the rest of
 * the site. They now render through FeatureBanner, the same component the
 * hand-set featured-collection block uses, so an admin-created banner and a
 * coded one are indistinguishable on the page.
 *
 * The stored `layout` value is finally honoured. It was ignored before (the
 * stack auto-alternated), so the admin select did nothing. With a full-bleed
 * image there is no "image side" left to pick, but there is a copy side, and
 * that is what the field now sets — same column, same two values, only the
 * label in the form changed.
 */
export async function HomeBanners() {
  const banners = await listEnabledBanners();
  if (banners.length === 0) return null;

  return (
    <div>
      {banners.map((b, idx) => {
        if (!b.imageUrl) return null;

        return (
          <div
            key={b.id}
            /* Adjacent banners are both full-bleed ink, so without a rule they
               read as one tall band. Same hairline weight the footer uses on
               ink — border-line is invisible against it. */
            className={idx > 0 ? "border-t border-paper/15" : undefined}
          >
            <FeatureBanner
              image={b.imageUrl}
              imageAlt={b.imageAlt || b.title || "Shoptees"}
              eyebrow={b.eyebrow || undefined}
              headline={b.title}
              body={b.body || undefined}
              ctaLabel={b.ctaLabel || undefined}
              ctaHref={b.ctaHref || "/shop"}
              align={b.layout === "imageRight" ? "right" : "left"}
            />
          </div>
        );
      })}
    </div>
  );
}
