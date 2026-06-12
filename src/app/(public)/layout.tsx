import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { getActiveCategories } from "@/lib/server/products";
import { getActiveCollections } from "@/lib/server/collections";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [categories, collections] = await Promise.all([
    getActiveCategories(),
    getActiveCollections(),
  ]);
  return (
    <>
      <AnnouncementBar />
      <Header
        collections={collections.map((c) => ({ slug: c.slug, name: c.name }))}
        categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
      />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}
