import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { FavoritesProvider } from "@/components/favorites";
export const metadata: Metadata = {
  metadataBase: new URL("https://findmydup.de"),
  title: {default: "FindMyDup | Wissen, das beim Einkaufen hilft",template: "%s | FindMyDup"},
  description: "Unabhängige Einkaufsratgeber für Mode, Beauty, Wohnen und Technik. Verstehe Materialien, Funktionen und Preise, bevor du kaufst.",
  robots: {index:true,follow:true},
  other: {verification:"00fd05c1707e91d286f87c424f566383"},
  openGraph: {type:"website",locale:"de_DE",siteName:"FindMyDup",title:"FindMyDup – Mehr wissen, besser einkaufen",description:"Verständliche Einkaufsratgeber für Mode, Beauty, Wohnen und Technik.",url:"https://findmydup.de"},
};
export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="de"><body><FavoritesProvider>
    <a href="#main" className="skip-link">Zum Inhalt springen</a>
    <Navigation />{children}<Footer />
  </FavoritesProvider></body></html>;
}
