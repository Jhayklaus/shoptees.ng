import { Hero } from "@/components/marketing/Hero";
import { FeaturedGrid } from "@/components/marketing/FeaturedGrid";
import { Manifesto } from "@/components/marketing/Manifesto";
import { EditorialSplit } from "@/components/marketing/EditorialSplit";
import { Newsletter } from "@/components/marketing/Newsletter";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedGrid />
      <Manifesto />
      <EditorialSplit />
      <Newsletter />
    </>
  );
}
