import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata = buildMetadata({ title: "Contact", path: "/contact" });

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-[1400px] px-5 md:px-10 pt-12 pb-24">
      <header className="grid grid-cols-12 gap-6 mb-16 border-b-[3px] border-ink pb-10">
        <div className="col-span-12 md:col-span-9">
          <span className="stamp text-vermillion">Open line</span>
          <h1 className="font-display text-7xl md:text-9xl leading-[0.9] mt-3">
            Write to <span className="text-vermillion">us.</span>
          </h1>
        </div>
      </header>

      <section className="grid grid-cols-12 gap-10">
        <div className="col-span-12 md:col-span-5">
          <p className="text-xl text-ink-soft leading-snug max-w-sm">
            We answer everything ourselves — restocks, custom orders, press,
            tailoring, anything. Usually within a day.
          </p>

          <ul className="mt-10 space-y-8 border-l-[3px] border-ink pl-6">
            <li>
              <span className="stamp text-ink/60">Email</span>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="block font-display text-2xl mt-1 hover:text-vermillion"
              >
                {siteConfig.contact.email}
              </a>
            </li>
            <li>
              <span className="stamp text-ink/60">WhatsApp</span>
              <p className="font-display text-2xl mt-1">{siteConfig.contact.phone}</p>
            </li>
            <li>
              <span className="stamp text-ink/60">Instagram · DMs open</span>
              <a
                href={siteConfig.social.instagram}
                className="block font-display text-2xl mt-1 hover:text-vermillion"
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
