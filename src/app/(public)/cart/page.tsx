import { buildMetadata } from "@/lib/seo";
import { CartView } from "@/components/cart/CartView";

export const metadata = buildMetadata({ title: "Cart", path: "/cart", noIndex: true });

export default function CartPage() {
  return <CartView />;
}
