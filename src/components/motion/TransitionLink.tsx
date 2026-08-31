"use client";

import Link from "next/link";
import { useRef } from "react";
import { useViewTransitionRouter } from "@/components/motion/ViewTransitions";

type Props = React.ComponentPropsWithoutRef<typeof Link> & {
  /**
   * Morph a descendant across the navigation. The descendant must carry
   * `data-morph`; on click it is tagged with `data-morph-active`, which
   * globals.css turns into the shared `view-transition-name`.
   */
  morph?: boolean;
};

/**
 * A `next/link` that routes through the View Transition API. Falls back to
 * ordinary Link behaviour for anything a normal link should keep doing:
 * new-tab clicks, modifier keys, external hrefs.
 */
export function TransitionLink({ morph, onClick, href, children, ...rest }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const { navigate } = useViewTransitionRouter();

  return (
    <Link
      {...rest}
      href={href}
      ref={ref}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;

        // Leave the browser's own behaviour alone for these.
        if (
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey ||
          e.button !== 0 ||
          rest.target === "_blank"
        ) {
          return;
        }

        const url = typeof href === "string" ? href : href.pathname ?? "";
        if (!url.startsWith("/")) return; // external or protocol-relative

        e.preventDefault();
        const element = morph
          ? ref.current?.querySelector<HTMLElement>("[data-morph]")
          : null;
        navigate(url, element ? { element, attribute: "data-morph-active" } : null);
      }}
    >
      {children}
    </Link>
  );
}
