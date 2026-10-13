import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { FavoritesProvider } from "@/components/favorites";
export const metadata: Metadata = {
  title: {
    default: "FindMyDup | Dein Stil. Für weniger.",
    template: "%s | FindMyDup",
  },
  description:
    "Entdecke den FindMyDup-Prototyp: Produktsuche per Name oder Foto mit klar gekennzeichneten Demoprodukten.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>
        <FavoritesProvider>
          <a href="#main" className="skip-link">
            Zum Inhalt springen
          </a>
          <Navigation />
          {children}
          <Footer />
        </FavoritesProvider>
      </body>
    </html>
  );
}
