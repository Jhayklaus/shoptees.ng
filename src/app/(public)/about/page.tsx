import Image from "next/image";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "About", path: "/about" });

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-[1400px] px-5 md:px-10 pt-8 pb-24">
      <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b border-line pb-5 mb-10">
        <div>
          <p className="font-label text-muted mb-2">A studio note</p>
          <h1 className="font-display text-[clamp(2rem,6vw,3.6rem)] max-w-[14ch]">
            Built here, worn everywhere
          </h1>
        </div>
        <div className="max-w-[44ch]">
          <p className="text-ink-soft text-[0.92rem] leading-snug">
            Shoptees is a Nigerian streetwear label working in apparel and
            football jerseys — for the everyday, the matchday, and the
            in-between. We sell by the piece, and by the carton.
          </p>
        </div>
      </header>

      <section className="grid grid-cols-12 gap-x-6 gap-y-12">
        <div className="shot col-span-12 md:col-span-5 aspect-square">
          <Image
            src="/about-img.webp"
            alt="Shoptees studio"
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover"
          />
        </div>

        <div className="col-span-12 md:col-span-6 md:col-start-7 md:pt-12">
          <h2 className="font-display text-[clamp(1.6rem,4vw,2.5rem)]">
            We make it to be worn
          </h2>
          <div className="mt-5 columns-1 md:columns-2 gap-8 text-ink-soft leading-relaxed text-[0.94rem]">
            <p className="break-inside-avoid">
              <span className="font-display text-[3.4rem] float-left mr-2.5 leading-[0.78] mt-1">S</span>
              hoptees is a small label out of Lagos working in cut-and-sew
              streetwear and football jerseys for men and women. Pieces are
              made to be worn hard — on the commute, in the stands, on the
              block.
            </p>
            <p className="break-inside-avoid mt-4 md:mt-0">
              We supply retail customers directly through this site, and we
              ship wholesale to stockists, shops and team kits across Nigeria.
              Same garments, same fits — one piece or one carton at a time.
            </p>
            <p className="break-inside-avoid mt-4">
              Football is in the work. From terrace classics to club-faithful
              kits, the jerseys we make sit next to the rest of the line
              because that&apos;s how they&apos;re actually worn — at the
              ground on Saturday, on the street on Monday.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-line py-9">
        {[
          ["Made in", "Lagos, NG"],
          ["Catalog", "Apparel + jerseys"],
          ["Wholesale", "By the carton"],
          ["Shipping", "Nationwide"],
        ].map(([k, v]) => (
          <div key={k}>
            <p className="font-label text-muted">{k}</p>
            <p className="font-sub text-lg mt-2">{v}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
