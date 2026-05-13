import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-5 md:px-10 py-32 text-center">
      <p className="font-mono-tight text-ink/55 mb-3">Lost in the studio</p>
      <h1 className="font-display text-[10rem] leading-none tracking-[-0.04em]">
        4<span className="font-italic-accent text-vermillion">0</span>4
      </h1>
      <p className="font-italic-accent text-2xl text-ink-soft mt-2">
        That page slipped behind the cutting table.
      </p>
      <Link
        href="/"
        className="inline-block mt-10 border border-ink px-6 py-3 font-mono-tight hover:bg-ink hover:text-paper transition-colors"
      >
        Back to home →
      </Link>
    </main>
  );
}
