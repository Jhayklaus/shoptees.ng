import { TransitionLink as Link } from "@/components/motion/TransitionLink";
import { footerNav } from "@/config/nav";
import { siteConfig } from "@/config/site";
import { getAllSettings } from "@/lib/server/settings";

const reel = [
  "SHOPTEES",
  "—",
  "Streetwear that speaks for YOU.",
  "—",
  "MADE IN NIGERIA",
  "—",
  "EST. [YYYY]",
  "—",
];

export async function Footer() {
  const settings = await getAllSettings();
  const items = Array.from({ length: 4 }).flatMap(() => reel);
  const tagline = settings["site.tagline"];
  const email = settings["contact.email"];

  return (
    <footer className="mt-24 bg-ink text-paper border-t-4 border-tan">
      <div className="marquee-hover border-b border-paper/15 py-5 overflow-hidden">
        <div className="flex animate-marquee-slow whitespace-nowrap will-change-transform">
          {items.map((t, i) => (
            <span
              key={i}
              className="font-display text-[3.2rem] md:text-[5rem] leading-none px-6 text-paper/95"
            >
              {t === "—" ? <span className="text-tan">■</span> : t}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-16 grid grid-cols-2 md:grid-cols-12 gap-10">
        <div className="col-span-2 md:col-span-5">
          <p className="font-italic-accent text-2xl md:text-3xl leading-tight max-w-md">
            {tagline}
          </p>
        </div>

        <div className="col-span-1 md:col-span-2">
          <h3 className="font-mono-tight text-paper/55 mb-3">Shop</h3>
          <ul className="space-y-2">
            {footerNav.shop.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-underline hover:text-tan transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-1 md:col-span-2">
          <h3 className="font-mono-tight text-paper/55 mb-3">Studio</h3>
          <ul className="space-y-2">
            {footerNav.company.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-underline hover:text-tan transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-2 md:col-span-3">
          <h3 className="font-mono-tight text-paper/55 mb-3">Elsewhere</h3>
          <ul className="space-y-2">
            <li>
              <a href={siteConfig.social.instagram} className="link-underline hover:text-tan transition-colors">
                Instagram ↗
              </a>
            </li>
            <li>
              <a href={siteConfig.social.x} className="link-underline hover:text-tan transition-colors">
                X / Twitter ↗
              </a>
            </li>
            <li className="pt-2 text-paper/55 text-sm">{email}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-paper/15">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="font-mono-tight text-paper/55">
            © {new Date().getFullYear()} Shoptees. All rights reserved.
          </p>
          <ul className="flex gap-5">
            {[
              { href: "/privacy", label: "Privacy" },
              { href: "/terms", label: "Terms" },
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="font-mono-tight text-paper/55 hover:text-tan transition-colors"
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
