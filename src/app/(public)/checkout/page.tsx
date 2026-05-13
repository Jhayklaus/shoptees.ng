import { buildMetadata } from "@/lib/seo";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata = buildMetadata({ title: "Checkout — Shoptees", path: "/checkout" });

export default function CheckoutPage() {
  return <CheckoutForm />;
}
