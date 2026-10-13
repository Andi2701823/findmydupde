import { SavedProducts } from "@/components/saved-products";
export const metadata = { title: "Deine Merkliste" };
export default function SavedPage() {
  return (
    <main id="main" className="shell results-page">
      <SavedProducts />
    </main>
  );
}
