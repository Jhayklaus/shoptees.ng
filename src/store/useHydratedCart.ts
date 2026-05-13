"use client";

import { useEffect, useState } from "react";
import { useCart } from "./cart";
import { useHydrated } from "./useHydrated";
import type { CartLineHydrated } from "@/types";

type State =
  | { status: "loading"; lines: CartLineHydrated[] }
  | { status: "ready"; lines: CartLineHydrated[]; dropped: string[] }
  | { status: "error"; lines: CartLineHydrated[]; error: string };

export function useHydratedCart(): State {
  const persisted = useHydrated();
  const lines = useCart((s) => s.lines);
  const remove = useCart((s) => s.remove);
  const [state, setState] = useState<State>({ status: "loading", lines: [] });

  // Stable serialization so the effect re-runs on actual change.
  const sig = JSON.stringify(lines);

  useEffect(() => {
    if (!persisted) return;
    let cancelled = false;
    if (lines.length === 0) {
      // Defer to next microtask so this isn't a synchronous setState in the effect body.
      queueMicrotask(() => {
        if (!cancelled) setState({ status: "ready", lines: [], dropped: [] });
      });
      return () => {
        cancelled = true;
      };
    }
    (async () => {
      try {
        const res = await fetch("/api/cart/hydrate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ lines }),
        });
        if (!res.ok) throw new Error(`hydrate ${res.status}`);
        const body = (await res.json()) as { lines: CartLineHydrated[]; dropped: string[] };
        if (cancelled) return;
        // Drop variants that no longer exist server-side from the client cart.
        for (const variantId of body.dropped) remove(variantId);
        setState({ status: "ready", lines: body.lines, dropped: body.dropped });
      } catch (e) {
        if (cancelled) return;
        setState({
          status: "error",
          lines: [],
          error: e instanceof Error ? e.message : "Failed to load cart",
        });
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persisted, sig]);

  return state;
}
