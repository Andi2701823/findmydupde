"use client";
import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { guides } from "@/lib/guides";
const storageKey = "findmydup:favorites";
const changeEvent = "findmydup:favorites-changed";
let memorySnapshot = "[]";
let storageUnavailable = false;
function snapshot() {
  try {return storageUnavailable ? memorySnapshot : localStorage.getItem(storageKey) || "[]";}
  catch {return memorySnapshot;}
}
function readIds(raw: string): string[] {
  try {
    const ids: unknown = JSON.parse(raw);
    return Array.isArray(ids) ? ids.filter((id): id is string =>
      typeof id === "string" && guides.some(g => g.slug === id)) : [];
  } catch { return []; }
}
function subscribe(notify: () => void) {
  window.addEventListener("storage", notify);
  window.addEventListener(changeEvent, notify);
  return () => {window.removeEventListener("storage", notify);window.removeEventListener(changeEvent, notify);};
}
function toggle(id: string) {
  if (!guides.some(g => g.slug === id)) return;
  const ids = readIds(snapshot());
  memorySnapshot = JSON.stringify(ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
  try { localStorage.setItem(storageKey, memorySnapshot); } catch {storageUnavailable = true;}
  window.dispatchEvent(new Event(changeEvent));
}
const FavoritesContext = createContext<{ids: string[];toggle:(id:string)=>void}>({ids:[],toggle:()=>{}});
export function FavoritesProvider({children}:{children:React.ReactNode}) {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "[]");
  const ids = useMemo(() => readIds(raw), [raw]);
  return <FavoritesContext.Provider value={{ids,toggle}}>{children}</FavoritesContext.Provider>;
}
export const useFavorites = () => useContext(FavoritesContext);
