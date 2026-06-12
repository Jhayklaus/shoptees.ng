import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-5 md:px-10 py-32 text-center">
      <span className="stamp text-vermillion">Lost in the studio</span>
      <h1 className="font-display text-[9rem] md:text-[12rem] leading-none mt-4">
        4<span className="text-vermillion">0</span>4
      </h1>
      <p className="text-xl text-ink-soft mt-4">
        That page slipped behind the cutting table.
      </p>
      <div className="mt-10 flex items-center justify-center gap-4">
        <Link
          href="/"
          className="btn-wipe btn-wipe-hazard inline-block bg-ink text-paper px-7 py-3.5 font-condensed text-[0.78rem] hover:text-paper transition-colors duration-200"
        >
          Back to home →
        </Link>
        <Link
          href="/shop"
          className="btn-wipe inline-block border-2 border-ink px-7 py-3.5 font-condensed text-[0.78rem] hover:text-paper transition-colors duration-200"
        >
          Browse the shop →
        </Link>
      </div>
    </main>
  );
}
