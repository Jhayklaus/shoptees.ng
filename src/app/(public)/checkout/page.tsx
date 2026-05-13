import { buildMetadata } from "@/lib/seo";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata = buildMetadata({ title: "Checkout", path: "/checkout", noIndex: true });

export default function CheckoutPage() {
  return <CheckoutForm />;
}
