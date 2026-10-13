"use client";
import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { products } from "@/lib/catalog";
const storageKey = "findmydup:favorites";
const changeEvent = "findmydup:favorites-changed";
let memorySnapshot = "[]";
let storageUnavailable = false;
function snapshot() {
  try {
    return storageUnavailable
      ? memorySnapshot
      : localStorage.getItem(storageKey) || "[]";
  } catch {
    return memorySnapshot;
  }
}
function readIds(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value)
      ? value.filter(
          (id): id is string =>
            typeof id === "string" && products.some((p) => p.id === id),
        )
      : [];
  } catch {
    return [];
  }
}
function subscribe(notify: () => void) {
  window.addEventListener("storage", notify);
  window.addEventListener(changeEvent, notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener(changeEvent, notify);
  };
}
function toggle(id: string) {
  const ids = readIds(snapshot());
  memorySnapshot = JSON.stringify(
    ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id],
  );
  try {
    localStorage.setItem(storageKey, memorySnapshot);
  } catch {
    storageUnavailable = true;
    /* Storage is optional, keep the current session usable. */
  }
  window.dispatchEvent(new Event(changeEvent));
}
const FavoritesContext = createContext<{
  ids: string[];
  toggle: (id: string) => void;
}>({ ids: [], toggle: () => {} });
export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "[]");
  const ids = useMemo(() => readIds(raw), [raw]);
  return (
    <FavoritesContext.Provider value={{ ids, toggle }}>
      {children}
    </FavoritesContext.Provider>
  );
}
export const useFavorites = () => useContext(FavoritesContext);
