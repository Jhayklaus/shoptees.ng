import Image from "next/image";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "About", path: "/about" });

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-[1400px] px-5 md:px-10 pt-12 pb-24">
      <header className="grid grid-cols-12 gap-6 mb-16 border-b border-line pb-10">
        <div className="col-span-12 md:col-span-8">
          <p className="font-mono-tight text-ink/55">A studio note</p>
          <h1 className="font-display text-7xl md:text-[10rem] leading-[0.85] tracking-[-0.04em] mt-2">
            Built <span className="font-italic-accent text-vermillion">here,</span>
            <br />
            worn everywhere.
          </h1>
        </div>
        <div className="col-span-12 md:col-span-4 md:pt-3">
          <p className="font-italic-accent text-xl text-ink/70">
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
          <h2 className="font-display text-4xl md:text-5xl leading-tight tracking-tight">
            We make it <span className="font-italic-accent text-vermillion">to be worn.</span>
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

      <section className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-line py-10">
        {[
          ["Made in", "Lagos, NG"],
          ["Catalog", "Apparel + jerseys"],
          ["Wholesale", "By the carton"],
          ["Shipping", "Nationwide"],
        ].map(([k, v]) => (
          <div key={k}>
            <p className="font-mono-tight text-ink/55">{k}</p>
            <p className="font-display text-3xl mt-1">{v}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
