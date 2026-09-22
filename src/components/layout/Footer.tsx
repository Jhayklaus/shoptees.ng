import Image from "next/image";
import Link from "next/link";
import { footerNav } from "@/config/nav";
import { siteConfig } from "@/config/site";
import { getAllSettings } from "@/lib/server/settings";

/**
 * Several SiteSetting rows still hold seeded "[PLACEHOLDER: …]" strings, and
 * they render straight onto the storefront. Until someone fills them in from
 * /admin, show nothing rather than showing the brackets to a customer.
 */
function settingOrNull(value: string | undefined) {
  const v = value?.trim();
  if (!v || v.startsWith("[PLACEHOLDER")) return null;
  return v;
}

export async function Footer() {
  const settings = await getAllSettings();
  const tagline = settingOrNull(settings["site.tagline"]) ?? siteConfig.description;
  const email = settingOrNull(settings["contact.email"]) ?? siteConfig.contact.email;

  return (
    <footer className="mt-20 bg-ink text-paper grain grain-dark">
      <div className="relative z-10 mx-auto max-w-[1400px] px-5 md:px-10 py-16 grid grid-cols-2 md:grid-cols-12 gap-10">
        <div className="col-span-2 md:col-span-5">
          {/* The wordmark itself, not the name set as a label. It is a white
              recolour of the same file the header uses — same oval, same five
              arched stars, alpha untouched — so the mark is never redrawn,
              only made legible on ink. */}
          <Link href="/" aria-label="Shoptees home" className="inline-block">
            <Image
              src="/logo-white.png"
              alt="Shoptees"
              width={378}
              height={197}
              className="h-11 md:h-[3.2rem] w-auto object-contain"
            />
          </Link>
          <p className="mt-5 font-sub text-lg md:text-xl leading-[1.3] max-w-sm normal-case tracking-normal">
            {tagline}
          </p>
        </div>

        <div className="col-span-1 md:col-span-2">
          <h3 className="font-label text-paper/55 mb-3">Shop</h3>
          <ul className="space-y-2">
            {footerNav.shop.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="font-label text-paper/80 hover:text-tan transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-1 md:col-span-2">
          <h3 className="font-label text-paper/55 mb-3">Studio</h3>
          <ul className="space-y-2">
            {footerNav.company.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="font-label text-paper/80 hover:text-tan transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-2 md:col-span-3">
          <h3 className="font-label text-paper/55 mb-3">Elsewhere</h3>
          <ul className="space-y-2">
            <li>
              <a
                href={siteConfig.social.instagram}
                className="font-label text-paper/80 hover:text-tan transition-colors"
              >
                Instagram ↗
              </a>
            </li>
            <li>
              <a
                href={siteConfig.social.x}
                className="font-label text-paper/80 hover:text-tan transition-colors"
              >
                X / Twitter ↗
              </a>
            </li>
            <li className="pt-2">
              <a
                href={`mailto:${email}`}
                className="font-label text-paper/70 hover:text-tan transition-colors normal-case"
              >
                {email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative z-10 border-t border-paper/15">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="font-label text-paper/55">
            © {new Date().getFullYear()} Shoptees · Lagos, Nigeria
          </p>
          <ul className="flex gap-5">
            {[
              { href: "/privacy", label: "Privacy" },
              { href: "/terms", label: "Terms" },
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="font-label text-paper/55 hover:text-tan transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
