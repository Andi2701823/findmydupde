import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { guides, findGuide } from "@/lib/guides";
import { GuideCard } from "@/components/guide-card";
import { Icon } from "@/components/icon";
export function generateStaticParams() { return guides.map(g => ({ slug: g.slug })); }
export function generateMetadata({ params }: { params: Promise<{slug: string}> }): Promise<Metadata> {
  return params.then(({slug}) => {
    const guide = findGuide(slug);
    if (!guide) return { title: "Ratgeber nicht gefunden" };
    return { title: guide.title, description: guide.excerpt,
      alternates: { canonical: `https://findmydup.de/ratgeber/${slug}/` } };
  });
}
export default async function GuidePage({ params }: { params: Promise<{slug: string}> }) {
  const {slug} = await params;
  const guide = findGuide(slug);
  if (!guide) notFound();
  const related = guides.filter(g => g.category === guide.category && g.slug !== guide.slug).slice(0,2);
  return (
    <main id="main" className="shell article-layout">
      <nav className="breadcrumb" aria-label="Brotkrumennavigation">
        <Link href="/">Startseite</Link><span>/</span><Link href="/ratgeber/">Ratgeber</Link><span>/</span>{guide.category}
      </nav>
      <article className="guide-article">
        <span className="eyebrow">{guide.category.toUpperCase()} · {guide.readMinutes} MINUTEN LESEZEIT</span>
        <h1>{guide.title}</h1>
        <p className="article-lead">{guide.excerpt}</p>
        <div className="article-index"><strong>In diesem Ratgeber</strong>
          <ol>{guide.sections.map((section,i) => <li key={i}><a href={`#abschnitt-${i+1}`}>{section.heading}</a></li>)}</ol>
        </div>
        {guide.sections.map((section,i) => (
          <section id={`abschnitt-${i+1}`} key={i} className="article-section">
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph,j) => <p key={j}>{paragraph}</p>)}
            {section.tips && <div className="article-tips"><h3>Deine Checkliste</h3><ul>{section.tips.map(tip => <li key={tip}>{tip}</li>)}</ul></div>}
          </section>
        ))}
        <aside className="article-disclosure">
          <strong>Transparenter Vergleich statt Preisversprechen</strong>
          <p>Dieser Ratgeber enthält allgemeine Einkaufshinweise und keine bezahlte Produktplatzierung. Preise, Verfügbarkeit und Produkteigenschaften sind beim jeweiligen Händler zu prüfen.</p>
        </aside>
      </article>
      <div className="article-next">
        <div className="section-heading"><div><span className="eyebrow">WEITERLESEN</span><h2>Weitere Ratgeber</h2></div>
          <Link className="text-link" href="/ratgeber/">Alle Themen <Icon name="arrow" /></Link></div>
        <div className="guides-grid">{related.map(g => <GuideCard key={g.slug} guide={g} />)}</div>
      </div>
    </main>
  );
}
