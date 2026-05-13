import { Hero } from "@/components/marketing/Hero";
import { FeaturedGrid } from "@/components/marketing/FeaturedGrid";
import { CollectionsGrid } from "@/components/marketing/CollectionsGrid";
import { Manifesto } from "@/components/marketing/Manifesto";
import { AnnouncementBanner } from "@/components/marketing/AnnouncementBanner";
import { Newsletter } from "@/components/marketing/Newsletter";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedGrid />
      <Manifesto />
      <CollectionsGrid />
      <AnnouncementBanner />
      <Newsletter />
    </>
  );
}
