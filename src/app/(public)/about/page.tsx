import Image from "next/image";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "About", path: "/about" });

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-[1400px] px-5 md:px-10 pt-12 pb-24">
      <header className="grid grid-cols-12 gap-6 mb-16 border-b-[3px] border-ink pb-10">
        <div className="col-span-12 md:col-span-8">
          <span className="stamp text-vermillion">A studio note</span>
          <h1 className="font-display text-5xl sm:text-7xl md:text-[9rem] leading-[0.88] mt-3">
            Built <span className="text-vermillion">here,</span>
            <br />
            worn everywhere.
          </h1>
        </div>
        <div className="col-span-12 md:col-span-4 md:self-end">
          <p className="text-lg text-ink/70 leading-snug max-w-sm">
            Shoptees is a Nigerian streetwear label working in apparel and
            football jerseys — for the everyday, the matchday, and the
            in-between. We sell by the piece, and by the carton.
          </p>
        </div>
      </header>

      <section className="grid grid-cols-12 gap-x-6 gap-y-12">
        <div className="col-span-12 md:col-span-5 relative aspect-square bg-paper-deep">
          <Image
            src="/about-img.webp"
            alt="Shoptees studio"
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover"
          />
        </div>

        <div className="col-span-12 md:col-span-6 md:col-start-7 md:pt-12">
          <h2 className="font-display text-4xl md:text-5xl leading-[0.95]">
            We make it <span className="text-vermillion">to be worn.</span>
          </h2>
          <div className="mt-6 columns-1 md:columns-2 gap-8 text-ink-soft leading-relaxed">
            <p className="break-inside-avoid">
              <span className="font-display text-6xl float-left mr-2 leading-[0.85] -mt-1">S</span>
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

      <section className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 border-y-[3px] border-ink py-10">
        {[
          ["Made in", "Lagos, NG"],
          ["Catalog", "Apparel + jerseys"],
          ["Wholesale", "By the carton"],
          ["Shipping", "Nationwide"],
        ].map(([k, v]) => (
          <div key={k}>
            <span className="stamp text-ink/60">{k}</span>
            <p className="font-display text-3xl mt-2">{v}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
