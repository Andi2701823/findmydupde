import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { FavoritesProvider } from "@/components/favorites";
import { ConsentProvider } from "@/components/consent-provider";
export const metadata: Metadata = {
  metadataBase: new URL("https://findmydup.de"),
  icons: { icon: [{url:"/icon.svg",type:"image/svg+xml",sizes:"any"}], shortcut:"/icon.svg" },
  title: {default: "FindMyDup | Wissen, das beim Einkaufen hilft",template: "%s | FindMyDup"},
  description: "FindMyDup hilft dir, Produkte zu suchen, Händlerpreise zu vergleichen und passende Alternativen zu entdecken. Mit transparenten Angeboten und Einkaufsratgebern.",
  robots: {index:true,follow:true},
  verification: {google:"YtCGA15drFx3pEG8yUQPmsIonnN8kDuFLIgtHicPnQY"},
  other: {verification:"00fd05c1707e91d286f87c424f566383"},
  openGraph: {type:"website",locale:"de_DE",siteName:"FindMyDup",title:"FindMyDup – Produkte suchen und Preise vergleichen",description:"Produkte finden, Händlerpreise vergleichen und passende Alternativen entdecken.",images:[{url:"https://findmydup.de/share-image/",width:1200,height:630,type:"image/png",alt:"FindMyDup – Produkte suchen und Preise vergleichen"}]},
  twitter: {card:"summary_large_image",title:"FindMyDup – Produkte suchen und Preise vergleichen",description:"Echte Händlerangebote entdecken, Preise vergleichen und Einkaufsratgeber lesen.",images:["https://findmydup.de/share-image/"]},
};
export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="de"><body><ConsentProvider><FavoritesProvider>
    <a href="#main" className="skip-link">Zum Inhalt springen</a>
    <Navigation />{children}<Footer />
  </FavoritesProvider></ConsentProvider></body></html>;
}
