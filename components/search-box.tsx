"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icon";
export function SearchBox({ compact = false, initialQuery = "" }: { compact?: boolean; initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [error, setError] = useState("");
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim().slice(0, 120);
    if (!value) { setError("Bitte gib ein Thema oder einen Produktnamen ein."); return; }
    setError("");
    router.push(`/suche/?q=${encodeURIComponent(value)}`);
  }
  return <section className={`search-box editorial-search ${compact ? "compact" : ""}`} aria-label="Einkaufsratgeber suchen">
    <form className="text-search" onSubmit={submit}>
      <label className="sr-only" htmlFor="product-query">Thema oder Produkt suchen</label>
      <Icon name="search" />
      <input id="product-query" type="search" maxLength={120} value={query} onChange={event => {setQuery(event.target.value);setError("");}}
        placeholder="Worüber möchtest du mehr wissen?" aria-invalid={!!error} aria-describedby={error ? "search-error" : "search-hint"} />
      <button className="button primary" type="submit">Ratgeber finden <Icon name="arrow" /></button>
    </form>
    <div className="suggestions">
      <span>Oft gesucht:</span>
      {["Gesichtsserum","Sneaker","Kopfhörer"].map(word => <button key={word} type="button" onClick={() => router.push(`/suche/?q=${encodeURIComponent(word)}`)}>{word} ↗</button>)}
    </div>
    {error && <p id="search-error" role="alert" className="error-message">{error}</p>}
    <p id="search-hint" className="search-note"><Icon name="shield" /> Durchsuche unsere unabhängigen Einkaufsratgeber – kostenlos und ohne Konto.</p>
  </section>;
}
