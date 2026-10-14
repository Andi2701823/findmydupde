import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { FavoritesProvider } from "@/components/favorites";
export const metadata: Metadata = {
  metadataBase: new URL("https://findmydup.de"),
  title: {default: "FindMyDup | Wissen, das beim Einkaufen hilft",template: "%s | FindMyDup"},
  description: "Echte Beauty-Produkte unseres Awin-Partners und Einkaufsratgeber für Mode, Beauty, Wohnen und Technik. Produkte vergleichen und bewusst einkaufen.",
  robots: {index:true,follow:true},
  verification: {google:"YtCGA15drFx3pEG8yUQPmsIonnN8kDuFLIgtHicPnQY"},
  other: {verification:"00fd05c1707e91d286f87c424f566383"},
  openGraph: {type:"website",locale:"de_DE",siteName:"FindMyDup",title:"FindMyDup – Mehr wissen, besser einkaufen",description:"Echte Beauty-Produkte entdecken und unabhängige Einkaufsratgeber lesen.",url:"https://findmydup.de"},
};
export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="de"><body><FavoritesProvider>
    <a href="#main" className="skip-link">Zum Inhalt springen</a>
    <Navigation />{children}<Footer />
  </FavoritesProvider></body></html>;
}
