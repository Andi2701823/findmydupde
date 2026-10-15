/** Curated digital tools are editorial entries, not comparable physical-product prices. */
export const funnelcockpit={
  name:"FunnelCockpit",
  slug:"funnelcockpit",
  path:"/digitale-tools/funnelcockpit/",
  affiliateUrl:"https://www.digistore24.com/redir/98201/andi271982/",
  officialUrl:"https://funnelcockpit.com/",
  pricingUrl:"https://funnelcockpit.com/pricing/",
  type:"Marketing-Software (Abo)",
  priceContext:"14 Tage für 1 €, danach regulär ab 47 €/Monat laut Anbieter (Stand: Oktober 2026).",
  summary:"Browserbasierte Software für Websites, Verkaufsfunnels, E-Mail-Marketing und Mitgliederbereiche."
} as const;

/** Deliberately narrow to avoid placing a generic digital subscription in unrelated shopping results. */
export function matchesFunnelcockpit(query:string):boolean {
  const normalized=query.toLocaleLowerCase("de").replace(/[-_]+/g," ").replace(/\s+/g," ").trim();
  return ["funnelcockpit","funnel cockpit","funnel builder","funnel software","funnelbuilder","funnelbaukasten"].some(term=>normalized.includes(term));
}
