"use client";

import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Route transitions on the browser's native View Transition API.
 *
 * Deliberately NOT React's <ViewTransition>: that component only exists in
 * React's experimental channel (Next vendors it behind
 * `experimental.viewTransition`), and a storefront taking payments has no
 * business running an experimental React build. The native API is the same
 * underlying browser feature, and browsers without it simply navigate.
 *
 * The awkward part is that `startViewTransition` wants the DOM updated inside
 * its callback, while an App Router navigation is async. So the callback
 * returns a promise that this provider resolves once the new route has
 * committed — with a timeout, because a transition whose promise never
 * settles leaves the page frozen under a screenshot.
 */

type MorphTarget = { element: HTMLElement; attribute: string } | null;
type Navigate = (href: string, morph?: MorphTarget) => void;

/** Marks the element on the INCOMING page that the morph should land on. */
const MORPH_TARGET = "data-morph-target";
const MORPH_ACTIVE = "data-morph-active";

const Ctx = createContext<{ navigate: Navigate }>({ navigate: () => {} });

/** Longest we will hold the page under a transition snapshot. */
const COMMIT_TIMEOUT_MS = 700;

export function ViewTransitions({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const pending = useRef<{
    resolve: () => void;
    timer: ReturnType<typeof setTimeout>;
    morphing: boolean;
  } | null>(null);

  // The new route has rendered — let the transition capture it.
  useEffect(() => {
    const p = pending.current;
    if (!p) return;
    pending.current = null;
    clearTimeout(p.timer);

    // Hand the shared name to the landing element, but only for a navigation
    // that actually started from a morph. The name must NOT live on the
    // product page permanently: it would then be a named element with no
    // counterpart on every navigation away from that page, and the browser
    // would fly the product image across the new page as a stray ghost.
    if (p.morphing) {
      document.querySelector(`[${MORPH_TARGET}]`)?.setAttribute(MORPH_ACTIVE, "");
    }
    p.resolve();
  }, [pathname]);

  const navigate = useCallback<Navigate>(
    (href, morph) => {
      const supported =
        typeof document !== "undefined" &&
        typeof document.startViewTransition === "function";
      const reduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!supported || reduced) {
        router.push(href);
        return;
      }

      // Tag the element that should morph across the navigation. Set as an
      // attribute (styled in globals.css) rather than an inline style so the
      // name lives in one place. Any element still tagged from an
      // interrupted navigation is cleared first: two elements sharing a
      // view-transition-name makes the browser drop the transition entirely.
      if (morph) {
        clearMorphNames();
        morph.element.setAttribute(morph.attribute, "");
      }

      const transition = document.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            const timer = setTimeout(() => {
              pending.current = null;
              resolve();
            }, COMMIT_TIMEOUT_MS);
            pending.current = { resolve, timer, morphing: Boolean(morph) };
            router.push(href);
          }),
      );

      // Always untag — both the card we left and the element we landed on —
      // whether the transition finished or was interrupted by another
      // navigation. A stale name collides with the next one.
      transition.finished.then(clearMorphNames, clearMorphNames);
    },
    [router],
  );

  return <Ctx.Provider value={{ navigate }}>{children}</Ctx.Provider>;
}

function clearMorphNames() {
  document
    .querySelectorAll(`[${MORPH_ACTIVE}]`)
    .forEach((el) => el.removeAttribute(MORPH_ACTIVE));
}

export function useViewTransitionRouter() {
  return useContext(Ctx);
}
