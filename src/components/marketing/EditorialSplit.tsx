import Image from "next/image";
import Link from "next/link";

export function EditorialSplit() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-28">
      <div className="grid grid-cols-12 gap-6 items-center">
        <div className="col-span-12 md:col-span-6 relative aspect-[4/5] bg-paper-deep">
          <Image
            src="/placeholders/product-4.svg"
            alt="[PLACEHOLDER editorial image]"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          <span className="absolute bottom-3 left-3 font-mono-tight bg-paper px-2 py-1">
            shot in [PLACEHOLDER · location]
          </span>
        </div>

        <div className="col-span-12 md:col-span-5 md:col-start-8">
          <p className="font-mono-tight text-ink/55 mb-3">Field notes</p>
          <h2 className="font-display text-5xl md:text-6xl leading-[0.95] tracking-tight">
            A wardrobe that
            <br />
            <span className="font-italic-accent text-vermillion">reads like a city.</span>
          </h2>
          <p className="mt-6 text-ink-soft text-lg leading-relaxed max-w-prose">
            <span className="font-display text-5xl float-left mr-2 leading-[0.85] -mt-0.5">S</span>
            we cut and screen-print every piece in a small studio off the
            mainland. The runs are short, the seams are double-stitched, and
            the dye lots are deliberately uneven — the way a chalk wall ages
            differently in different light.
          </p>
          <p className="mt-4 font-italic-accent text-ink/55 text-lg">
            [PLACEHOLDER — replace with the founder&apos;s actual words.]
          </p>
          <Link
            href="/about"
            className="mt-8 inline-block font-mono-tight border border-ink px-5 py-3 hover:bg-ink hover:text-paper transition-colors"
          >
            More about the studio →
          </Link>
        </div>
      </div>
    </section>
  );
}
