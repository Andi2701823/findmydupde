"use client";
import Link from "next/link";
import type { Guide } from "@/lib/guides";
import { useFavorites } from "./favorites";
import { Icon } from "./icon";
export function GuideCard({ guide }: { guide: Guide }) {
  const { ids, toggle } = useFavorites();
  const saved = ids.includes(guide.slug);
  return (
    <article className="guide-card">
      <div className="guide-card-top">
        <span className="guide-category">{guide.category}</span>
        <button type="button" className="guide-save" onClick={() => toggle(guide.slug)}
          aria-label={saved ? `„${guide.title}“ aus Merkliste entfernen` : `„${guide.title}“ merken`}
          aria-pressed={saved}>
          <Icon name="heart" /> <span>{saved ? "Gemerkt" : "Merken"}</span>
        </button>
      </div>
      <h3><Link href={`/ratgeber/${guide.slug}/`}>{guide.title}</Link></h3>
      <p>{guide.excerpt}</p>
      <div className="guide-card-bottom">
        <span>{guide.readMinutes} Min. Lesezeit</span>
        <Link href={`/ratgeber/${guide.slug}/`} className="text-link" aria-label={`Ratgeber lesen: ${guide.title}`}>
          Ratgeber lesen <Icon name="arrow" />
        </Link>
      </div>
    </article>
  );
}
