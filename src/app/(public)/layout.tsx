import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { getActiveCategories } from "@/lib/server/products";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const categories = await getActiveCategories();
  return (
    <>
      <AnnouncementBar />
      <Header categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}
