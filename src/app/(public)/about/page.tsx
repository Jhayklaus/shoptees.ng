import Image from "next/image";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "About — Shoptees", path: "/about" });

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-[1400px] px-5 md:px-10 pt-12 pb-24">
      <header className="grid grid-cols-12 gap-6 mb-16 border-b border-line pb-10">
        <div className="col-span-12 md:col-span-8">
          <p className="font-mono-tight text-ink/55">A studio note</p>
          <h1 className="font-display text-7xl md:text-[10rem] leading-[0.85] tracking-[-0.04em] mt-2">
            Cotton, <span className="font-italic-accent text-vermillion">ink,</span>
            <br />
            and a lot of stubbornness.
          </h1>
        </div>
        <div className="col-span-12 md:col-span-4 md:pt-3">
          <p className="font-italic-accent text-xl text-ink/70">
            [PLACEHOLDER — replace with verbatim founder statement once
            provided. The text below is structural placeholder copy intended
            to demonstrate the editorial layout, NOT real brand history.]
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
            We started small <span className="font-italic-accent text-vermillion">on purpose.</span>
          </h2>
          <div className="mt-6 columns-1 md:columns-2 gap-8 text-ink-soft leading-relaxed">
            <p className="break-inside-avoid">
              <span className="font-display text-6xl float-left mr-2 leading-[0.85] -mt-1">L</span>
              orem ipsum dolor sit amet, consectetur adipiscing elit. Praesent
              ultrices odio in eros pretium, vel rutrum velit gravida. Etiam
              auctor, ipsum nec faucibus efficitur.
            </p>
            <p className="break-inside-avoid mt-4 md:mt-0">
              [PLACEHOLDER paragraph]. Replace with the founder&apos;s actual
              account of why the studio exists, where the first piece was
              printed, and what stays the same season after season.
            </p>
            <p className="break-inside-avoid mt-4">
              [PLACEHOLDER paragraph]. We will fill this with real provenance
              once the user supplies it. Until then this column reads like a
              dummy magazine spread.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-line py-10">
        {[
          ["Founded", "[YYYY]"],
          ["Studio", "Lagos, NG"],
          ["Drops / yr", "≤ 4"],
          ["Press", "[PLACEHOLDER]"],
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
