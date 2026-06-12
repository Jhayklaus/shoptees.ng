import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Terms & Conditions", path: "/terms" });

const SECTIONS = [
  {
    title: "Using the site",
    body: "By accessing shoptees.ng you agree to these terms. The site is intended for customers aged 18 or over. We reserve the right to refuse or cancel any order at our discretion.",
  },
  {
    title: "Orders & payment",
    body: "An order is confirmed once payment has cleared through Paystack. Prices are listed in Nigerian Naira (NGN) and include any applicable taxes. We reserve the right to correct pricing errors before confirming an order.",
  },
  {
    title: "Shipping",
    body: "We ship nationwide from Lagos. Estimated delivery times are provided at checkout and are not guaranteed. Risk passes to the customer once the order is handed to our delivery partner.",
  },
  {
    title: "Returns & exchanges",
    body: "Unworn, unwashed items in original condition may be returned within 14 days of receipt. Custom or personalised pieces are non-returnable. Contact us before sending anything back so we can arrange a return reference.",
  },
  {
    title: "Wholesale",
    body: "Wholesale orders (by the carton) are subject to a separate agreement. Minimum quantities, lead times, and terms are confirmed in writing before any order is placed.",
  },
  {
    title: "Intellectual property",
    body: "All designs, graphics, and brand assets on this site are owned by Shoptees or its licensors. Reproduction, redistribution, or use for commercial purposes without written permission is prohibited.",
  },
  {
    title: "Limitation of liability",
    body: "To the maximum extent permitted by law, Shoptees is not liable for indirect, incidental, or consequential damages arising from use of the site or any products purchased through it.",
  },
  {
    title: "Governing law",
    body: "These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be subject to the exclusive jurisdiction of the courts of Lagos State.",
  },
];

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-[1400px] px-5 md:px-10 pt-12 pb-24">
      <header className="mb-16 border-b-[3px] border-ink pb-8 grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-8">
          <span className="stamp text-vermillion">Legal</span>
          <h1 className="font-display text-6xl md:text-8xl leading-[0.92] mt-3">
            Terms &amp; <span className="text-vermillion">conditions.</span>
          </h1>
        </div>
        <div className="col-span-12 md:col-span-4 md:self-end">
          <p className="font-mono-tight text-ink/55">
            Effective date: June 2025
            <br />
            Shoptees · Lagos, Nigeria
          </p>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-8 space-y-12">
          {SECTIONS.map((s, i) => (
            <section key={s.title} className="grid grid-cols-12 gap-4">
              <div className="col-span-12 sm:col-span-4">
                <span className="stamp text-ink/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="font-display text-2xl mt-2">{s.title}</h2>
              </div>
              <p className="col-span-12 sm:col-span-8 text-ink-soft leading-relaxed">
                {s.body}
              </p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
