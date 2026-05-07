"use client";

import { useSyncExternalStore } from "react";
import { useCart } from "./cart";

// Subscribes to zustand's persist rehydration so we only render cart-dependent
// UI after the localStorage state has been merged in.
function subscribe(callback: () => void) {
  return useCart.persist.onFinishHydration(callback);
}

function getSnapshot() {
  return useCart.persist.hasHydrated();
}

function getServerSnapshot() {
  return false;
}

export function useHydrated() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
