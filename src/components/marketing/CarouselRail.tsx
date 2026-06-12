"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Horizontal snap-scroll rail with desktop arrow controls. Touch/trackpad
// scrolling always works; the arrows only render on md+ and disappear when
// the content fits without overflow. Server sections (New in, Shop by
// category) pass their already-rendered cards in as children.
export function CarouselRail({
  ariaLabel,
  className = "",
  children,
}: {
  ariaLabel: string;
  className?: string;
  children: React.ReactNode;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const sync = () => {
      setCanPrev(el.scrollLeft > 4);
      setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    // rAF so the first measurement happens after layout, not synchronously
    // inside the effect body.
    const raf = requestAnimationFrame(sync);
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  const scroll = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  const hasOverflow = canPrev || canNext;

  return (
    <div className="relative">
      <div
        ref={railRef}
        role="region"
        aria-label={ariaLabel}
        className={[
          "flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          className,
        ].join(" ")}
      >
        {children}
      </div>

      {hasOverflow && (
        <>
          <RailArrow
            side="left"
            disabled={!canPrev}
            onClick={() => scroll(-1)}
            label={`Scroll ${ariaLabel} backwards`}
          >
            <ChevronLeft size={18} />
          </RailArrow>
          <RailArrow
            side="right"
            disabled={!canNext}
            onClick={() => scroll(1)}
            label={`Scroll ${ariaLabel} forwards`}
          >
            <ChevronRight size={18} />
          </RailArrow>
        </>
      )}
    </div>
  );
}

function RailArrow({
  side,
  disabled,
  onClick,
  label,
  children,
}: {
  side: "left" | "right";
  disabled: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={[
        "hidden md:flex absolute top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center",
        "border border-line bg-paper/90 backdrop-blur-sm text-ink transition-all",
        "hover:border-ink hover:text-vermillion",
        "disabled:opacity-0 disabled:pointer-events-none",
        side === "left" ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
