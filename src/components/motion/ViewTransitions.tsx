"use client";

import { useCallback, useEffect, useRef } from "react";
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
 * Every internal link is caught here, in one capture-phase listener, rather
 * than by wrapping each <Link> in a custom component. Coverage was the whole
 * problem with the wrapper approach: the header cart, shop filters,
 * breadcrumbs and the collections pages all kept plain links, so most of the
 * site navigated with no transition at all and the feature looked broken.
 * A listener cannot be forgotten by the next link someone adds.
 *
 * Capture phase matters: it runs before React's own handlers, and Next's
 * <Link> checks `e.defaultPrevented` and bails, so there is no double
 * navigation. We deliberately do NOT stopPropagation — menus and dropdowns
 * still get their click and close themselves.
 *
 * The awkward part is that `startViewTransition` wants the DOM updated inside
 * its callback, while an App Router navigation is async. So the callback
 * returns a promise resolved once the new route has committed — with a
 * timeout, because a transition whose promise never settles leaves the page
 * frozen under a screenshot.
 */

/** Marks the element on the INCOMING page a morph should land on. */
const MORPH_TARGET = "data-morph-target";
/** Carries the shared view-transition-name; only ever set while morphing. */
const MORPH_ACTIVE = "data-morph-active";
/** Opt a single link out of transitions: <a data-no-transition>. */
const OPT_OUT = "data-no-transition";

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

  const navigate = useCallback(
    (href: string, morphElement: HTMLElement | null) => {
      if (!supportsViewTransitions() || prefersReducedMotion()) {
        router.push(href);
        return;
      }

      // Any element still tagged from an interrupted navigation is cleared
      // first: two elements sharing a view-transition-name makes the browser
      // drop the transition entirely.
      if (morphElement) {
        clearMorphNames();
        morphElement.setAttribute(MORPH_ACTIVE, "");
      }

      const transition = document.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            const timer = setTimeout(() => {
              pending.current = null;
              resolve();
            }, COMMIT_TIMEOUT_MS);
            pending.current = { resolve, timer, morphing: Boolean(morphElement) };
            router.push(href);
          }),
      );

      // Always untag — both the element we left and the one we landed on —
      // whether the transition finished or was interrupted by another
      // navigation. A stale name collides with the next one.
      transition.finished.then(clearMorphNames, clearMorphNames);
    },
    [router],
  );

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = resolveInternalLink(event);
      if (!target) return;

      event.preventDefault();
      // A card can nominate the element that should fly to the next page.
      const morphElement = target.anchor.querySelector<HTMLElement>("[data-morph]");
      navigate(target.href, morphElement);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [navigate]);

  return <>{children}</>;
}

/**
 * The click is ours only if it is a plain left-click on a same-origin link
 * that actually changes the page. Everything else — new-tab clicks, downloads,
 * external hosts, in-page anchors — keeps the browser's own behaviour.
 */
function resolveInternalLink(event: MouseEvent): { anchor: HTMLElement; href: string } | null {
  if (event.defaultPrevented) return null;
  if (event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;

  const node = event.target as Element | null;
  const anchor = node?.closest?.("a");
  if (!anchor) return null;
  if (anchor.hasAttribute("download") || anchor.hasAttribute(OPT_OUT)) return null;

  const linkTarget = anchor.getAttribute("target");
  if (linkTarget && linkTarget !== "_self") return null;

  const raw = anchor.getAttribute("href");
  if (!raw || raw.startsWith("#")) return null;

  let url: URL;
  try {
    url = new URL((anchor as HTMLAnchorElement).href, location.href);
  } catch {
    return null;
  }
  // mailto:, tel:, and any other host.
  if (url.origin !== location.origin) return null;
  // Same page — either a pure hash jump or a no-op. Let the browser scroll.
  if (url.pathname === location.pathname && url.search === location.search) return null;

  return { anchor: anchor as HTMLElement, href: url.pathname + url.search };
}

function supportsViewTransitions() {
  return typeof document !== "undefined" && typeof document.startViewTransition === "function";
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function clearMorphNames() {
  document
    .querySelectorAll(`[${MORPH_ACTIVE}]`)
    .forEach((el) => el.removeAttribute(MORPH_ACTIVE));
}
