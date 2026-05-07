import { buildMetadata } from "@/lib/seo";
import { CartView } from "@/components/cart/CartView";

export const metadata = buildMetadata({ title: "Cart — Shoptees", path: "/cart" });

export default function CartPage() {
  return <CartView />;
}
