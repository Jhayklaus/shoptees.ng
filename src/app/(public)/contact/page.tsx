import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata = buildMetadata({ title: "Contact", path: "/contact" });

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-[1400px] px-5 md:px-10 pt-8 pb-24">
      <header className="border-b border-line pb-5 mb-10">
        <p className="font-label text-muted mb-2">Open line</p>
        <h1 className="font-display text-[clamp(1.9rem,5vw,3rem)]">Write to us</h1>
      </header>

      <section className="grid grid-cols-12 gap-y-10 gap-x-2 md:gap-10">
        <div className="col-span-12 md:col-span-5">
          <p className="text-ink-soft leading-snug max-w-[40ch] text-[0.95rem]">
            We answer everything ourselves — restocks, custom orders, press,
            tailoring, anything. Usually within a day.
          </p>

          <ul className="mt-8 divide-y divide-line border-y border-line">
            <li className="py-4">
              <p className="font-label text-muted">Email</p>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="block font-sub text-[1.02rem] mt-1.5 hover:underline underline-offset-4 decoration-1"
              >
                {siteConfig.contact.email}
              </a>
            </li>
            <li className="py-4">
              <p className="font-label text-muted">WhatsApp</p>
              <p className="font-sub text-[1.02rem] mt-1.5">{siteConfig.contact.phone}</p>
            </li>
            <li className="py-4">
              <p className="font-label text-muted">Instagram · DMs open</p>
              <a
                href={siteConfig.social.instagram}
                className="block font-sub text-[1.02rem] mt-1.5 hover:underline underline-offset-4 decoration-1"
              >
                @shopteesng
              </a>
            </li>
          </ul>
        </div>

        <ContactForm />
      </section>
    </main>
  );
}
