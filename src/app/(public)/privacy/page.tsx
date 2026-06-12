import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Privacy Policy", path: "/privacy" });

const SECTIONS = [
  {
    title: "What we collect",
    body: "We collect your name, email address, phone number, and delivery address when you place an order or subscribe to our newsletter. We do not collect payment card details — payments are handled directly by Paystack.",
  },
  {
    title: "How we use it",
    body: "Your information is used solely to process and deliver your order, send order confirmations, and — if you opt in — to notify you of new drops and restocks. We never sell your data to third parties.",
  },
  {
    title: "Third parties",
    body: "We share only what is necessary with our delivery partners (name, address, phone) and with Paystack for payment processing. Both are bound by their own data-protection obligations.",
  },
  {
    title: "Retention",
    body: "Order records are kept for seven years to comply with Nigerian tax and accounting law. Newsletter subscribers may unsubscribe at any time via the link in any email.",
  },
  {
    title: "Your rights",
    body: "You may request a copy of the personal data we hold, ask us to correct it, or ask us to delete it (subject to legal retention requirements). Write to us at the address on the Contact page.",
  },
  {
    title: "Cookies",
    body: "This site uses session cookies to keep your cart alive while you browse. No tracking or advertising cookies are set. Analytics, if enabled, are collected in aggregate with no personally identifiable information.",
  },
  {
    title: "Changes",
    body: "We may update this policy from time to time. The date at the top of this page reflects the last revision. Continued use of the site after a change constitutes acceptance.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-[1400px] px-5 md:px-10 pt-12 pb-24">
      <header className="mb-16 border-b-[3px] border-ink pb-8 grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-8">
          <span className="stamp text-vermillion">Legal</span>
          <h1 className="font-display text-6xl md:text-8xl leading-[0.92] mt-3">
            Privacy <span className="text-vermillion">policy.</span>
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
