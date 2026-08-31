import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { getActiveCategories } from "@/lib/server/products";
import { getActiveCollections } from "@/lib/server/collections";
import { getCurrencyOptions } from "@/lib/server/currency";
import { CurrencyProvider } from "@/components/currency/CurrencyProvider";
import { ViewTransitions } from "@/components/motion/ViewTransitions";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [categories, collections, currency] = await Promise.all([
    getActiveCategories(),
    getActiveCollections(),
    getCurrencyOptions(),
  ]);
  return (
    <CurrencyProvider options={currency}>
      <ViewTransitions>
        <AnnouncementBar />
        <Header
          collections={collections.map((c) => ({ slug: c.slug, name: c.name }))}
          categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
        />
        <div className="flex-1">{children}</div>
        <Footer />
      </ViewTransitions>
    </CurrencyProvider>
  );
}
