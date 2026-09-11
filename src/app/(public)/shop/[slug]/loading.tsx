import { ProductDetailSkeleton } from "@/components/ui/Skeleton";

// Carries the morph target, so a product image clicked on the grid lands
// here while the product itself is still being fetched.
export default function ProductLoading() {
  return <ProductDetailSkeleton />;
}
