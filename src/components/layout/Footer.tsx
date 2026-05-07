import Link from "next/link";
import { footerNav } from "@/config/nav";
import { siteConfig } from "@/config/site";

const reel = [
  "SHOPTEES",
  "—",
  "[PLACEHOLDER TAGLINE]",
  "—",
  "MADE IN NIGERIA",
  "—",
  "EST. [YYYY]",
  "—",
];

export function Footer() {
  const items = Array.from({ length: 4 }).flatMap(() => reel);

  return (
    <footer className="mt-24 bg-ink text-paper">
      <div className="border-b border-paper/15 py-5 overflow-hidden">
        <div className="flex animate-marquee-slow whitespace-nowrap will-change-transform">
          {items.map((t, i) => (
            <span
              key={i}
              className="font-display text-[3.5rem] md:text-[5.5rem] leading-none px-6 text-paper/95"
              style={{ fontVariationSettings: '"opsz" 144, "WONK" 1' }}
            >
              {t === "—" ? <span className="text-vermillion">—</span> : t}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-16 grid grid-cols-2 md:grid-cols-12 gap-10">
        <div className="col-span-2 md:col-span-5">
          <p className="font-italic-accent text-2xl md:text-3xl leading-tight max-w-md">
            A small studio working in cotton, &amp; ink.{" "}
            <span className="text-paper/55">
              [PLACEHOLDER: replace with verbatim brand description.]
            </span>
          </p>
        </div>

        <div className="col-span-1 md:col-span-2">
          <h3 className="font-mono-tight text-paper/55 mb-3">Shop</h3>
          <ul className="space-y-2">
            {footerNav.shop.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-vermillion transition-colors">
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
                <Link href={l.href} className="hover:text-vermillion transition-colors">
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
              <a href={siteConfig.social.instagram} className="hover:text-vermillion transition-colors">
                Instagram ↗
              </a>
            </li>
            <li>
              <a href={siteConfig.social.x} className="hover:text-vermillion transition-colors">
                X / Twitter ↗
              </a>
            </li>
            <li className="pt-2 text-paper/55 text-sm">{siteConfig.contact.email}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-paper/15">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="font-mono-tight text-paper/55">
            © {new Date().getFullYear()} Shoptees. All rights reserved.
          </p>
          <ul className="flex gap-5">
            {footerNav.legal.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="font-mono-tight text-paper/55 hover:text-vermillion">
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
