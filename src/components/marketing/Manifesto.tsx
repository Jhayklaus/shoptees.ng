export function Manifesto() {
  return (
    <section className="bg-ink text-paper py-28 relative overflow-hidden mt-32">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 grid grid-cols-12 gap-6">
        <p className="col-span-12 md:col-span-3 font-mono-tight text-paper/55">
          Manifesto · §02
        </p>

        <div className="col-span-12 md:col-span-9">
          <p className="font-display text-3xl md:text-[3.4rem] leading-[1.05] tracking-tight">
            <span className="font-italic-accent text-vermillion">We make</span> a small number of
            garments, in heavy cotton, in colourways borrowed from harmattan
            dust, palm-wine clay, and the burnt edges of a plantain skin. We
            print slowly. We ship in paper. We answer DMs ourselves.
          </p>
          <p className="mt-6 font-mono-tight text-paper/55 max-w-md">
            What good are wings without the courage to fly.
          </p>
        </div>
      </div>

      {/* Diagonal vermillion bar */}
      <div className="absolute -bottom-2 left-0 right-0 h-1 bg-vermillion" />
    </section>
  );
}
