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

const Ctx = createContext<{ navigate: Navigate }>({ navigate: () => {} });

/** Longest we will hold the page under a transition snapshot. */
const COMMIT_TIMEOUT_MS = 700;

export function ViewTransitions({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const pending = useRef<{ resolve: () => void; timer: ReturnType<typeof setTimeout> } | null>(
    null,
  );

  // The new route has rendered — let the transition capture it.
  useEffect(() => {
    const p = pending.current;
    if (!p) return;
    pending.current = null;
    clearTimeout(p.timer);
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
        document
          .querySelectorAll(`[${morph.attribute}]`)
          .forEach((el) => el.removeAttribute(morph.attribute));
        morph.element.setAttribute(morph.attribute, "");
      }

      const transition = document.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            const timer = setTimeout(() => {
              pending.current = null;
              resolve();
            }, COMMIT_TIMEOUT_MS);
            pending.current = { resolve, timer };
            router.push(href);
          }),
      );

      // Always untag, whether the transition finished or was interrupted by
      // another navigation — a stale name would collide with the next one.
      const untag = () => morph?.element.removeAttribute(morph.attribute);
      transition.finished.then(untag, untag);
    },
    [router],
  );

  return <Ctx.Provider value={{ navigate }}>{children}</Ctx.Provider>;
}

export function useViewTransitionRouter() {
  return useContext(Ctx);
}
