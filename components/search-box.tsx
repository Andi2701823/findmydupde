"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { categories } from "@/lib/catalog";
import { validateImage } from "@/lib/upload";
import type { Category } from "@/lib/types";
import { Icon } from "./icon";
export function SearchBox({
  compact = false,
  initialQuery = "",
  liveCatalog = false,
}: {
  compact?: boolean;
  initialQuery?: string;
  liveCatalog?: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"text" | "image">("text");
  const [query, setQuery] = useState(initialQuery);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [category, setCategory] = useState<Category>("Mode");
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  function acceptFile(next?: File) {
    if (!next) return;
    const issue = validateImage(next);
    setError(issue || "");
    if (!issue) {
      setFile(next);
      setPreview(URL.createObjectURL(next));
    }
  }
  function submitText(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) {
      setError("Bitte gib einen Produktnamen ein.");
      return;
    }
    setError("");
    router.push(`/suche/?q=${encodeURIComponent(query.trim().slice(0, 120))}`);
  }
  return (
    <section
      className={`search-box ${compact ? "compact" : ""}`}
      aria-label="Produktsuche"
    >
      <div role="tablist" aria-label="Suchmethode" className="search-tabs">
        <button
          id="tab-text"
          role="tab"
          aria-selected={tab === "text"}
          aria-controls="panel-text"
          tabIndex={tab === "text" ? 0 : -1}
          onClick={() => {
            setTab("text");
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
              setTab("image");
              document.getElementById("tab-image")?.focus();
            }
          }}
        >
          <Icon name="search" /> Produktname
        </button>
        <button
          id="tab-image"
          role="tab"
          aria-selected={tab === "image"}
          aria-controls="panel-image"
          tabIndex={tab === "image" ? 0 : -1}
          onClick={() => {
            setTab("image");
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
              setTab("text");
              document.getElementById("tab-text")?.focus();
            }
          }}
        >
          <Icon name="image" /> Foto hochladen
        </button>
      </div>
      {tab === "text" ? (
        <div id="panel-text" role="tabpanel" aria-labelledby="tab-text">
          <form onSubmit={submitText} className="text-search">
            <label className="sr-only" htmlFor="product-query">
              Produktname
            </label>
            <Icon name="search" />
            <input
              id="product-query"
              value={query}
              maxLength={120}
              onChange={(e) => {
                setQuery(e.target.value);
                setError("");
              }}
              placeholder="Was gefällt dir? Zum Beispiel: Tasche"
              aria-invalid={!!error}
              aria-describedby={error ? "search-error" : "demo-hint"}
            />
            <button className="button primary" type="submit">
              Entdecken <Icon name="arrow" />
            </button>
          </form>
          <div className="suggestions">
            <span>Zum Ausprobieren:</span>
            {["Tasche", "Sneaker", "Tischlampe"].map((word) => (
              <button
                key={word}
                onClick={() =>
                  router.push(`/suche/?q=${encodeURIComponent(word)}`)
                }
              >
                {word} ↗
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div id="panel-image" role="tabpanel" aria-labelledby="tab-image">
          <div
            className={`upload-zone ${dragging ? "dragging" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              acceptFile(e.dataTransfer.files[0]);
            }}
          >
            <input
              ref={input}
              type="file"
              id="product-image"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => {
                acceptFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            {preview ? (
              <div className="preview-row">
                <Image
                  unoptimized
                  width={70}
                  height={70}
                  src={preview}
                  alt="Vorschau deines ausgewählten Produktbildes"
                  onError={() => {
                    setFile(null);
                    setPreview("");
                    setError(
                      "Das Bild lässt sich nicht öffnen. Bitte wähle ein anderes Bild.",
                    );
                  }}
                />
                <div>
                  <strong>{file?.name}</strong>
                  <button
                    className="text-link"
                    onClick={() => {
                      setFile(null);
                      setPreview("");
                      setError("");
                    }}
                  >
                    Bild entfernen
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="upload-icon">
                  <Icon name="upload" />
                </span>
                <strong>Dein Fundstück beginnt hier.</strong>
                <span>Foto oder Screenshot hineinziehen</span>
              </>
            )}
            <button
              className="button secondary"
              onClick={() => input.current?.click()}
            >
              {file ? "Anderes Bild wählen" : "Bild auswählen"}
            </button>
            <small>JPG, PNG oder WebP · maximal 5 MB</small>
          </div>
          <p className="image-disclaimer">
            Dein Bild bleibt auf deinem Gerät. Diese Demo erkennt keine
            Bildinhalte. Wähle einen Bereich für passende Beispielprodukte.
          </p>
          <div className="image-actions">
            <label htmlFor="demo-category">
              Beispielbereich
              <select
                id="demo-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <button
              className="button primary"
              disabled={!file}
              onClick={() =>
                router.push(
                  `/suche/?mode=image-demo&category=${encodeURIComponent(category)}`,
                )
              }
            >
              Demo-Ergebnisse ansehen <Icon name="arrow" />
            </button>
          </div>
        </div>
      )}
      {error && (
        <p id="search-error" role="alert" className="error-message">
          {error}
        </p>
      )}
      <p id="demo-hint" className="search-note">
        <Icon name="shield" /> {liveCatalog
          ? "Textsuche mit echten Katalogangeboten · Bildsuche weiterhin Demo"
          : "Kostenlos ausprobieren · Nur Demoprodukte, keine Live-Suche"}
      </p>
    </section>
  );
}
