import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { Mail, Phone, AtSign } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata = buildMetadata({ title: "Contact", path: "/contact" });

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-[1400px] px-5 md:px-10 pt-12 pb-24">
      <header className="grid grid-cols-12 gap-6 mb-16 border-b border-line pb-10">
        <div className="col-span-12 md:col-span-9">
          <p className="font-mono-tight text-ink/55">Open line</p>
          <h1 className="font-display text-7xl md:text-9xl leading-[0.9] tracking-[-0.03em] mt-2">
            Write to <span className="font-italic-accent text-vermillion">us.</span>
          </h1>
        </div>
      </header>

      <section className="grid grid-cols-12 gap-10">
        <div className="col-span-12 md:col-span-5">
          <p className="font-italic-accent text-2xl text-ink-soft leading-snug">
            We answer everything ourselves — restocks, custom orders, press,
            tailoring, anything. Usually within a day.
          </p>

          <ul className="mt-10 space-y-6">
            <li className="flex items-start gap-4">
              <Mail size={18} className="mt-1.5 text-vermillion shrink-0" />
              <div>
                <p className="font-mono-tight text-ink/55">Email</p>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="font-display text-2xl hover:text-vermillion"
                >
                  {siteConfig.contact.email}
                </a>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <Phone size={18} className="mt-1.5 text-vermillion shrink-0" />
              <div>
                <p className="font-mono-tight text-ink/55">WhatsApp</p>
                <p className="font-display text-2xl">{siteConfig.contact.phone}</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <AtSign size={18} className="mt-1.5 text-vermillion shrink-0" />
              <div>
                <p className="font-mono-tight text-ink/55">Instagram (DMs open)</p>
                <a
                  href={siteConfig.social.instagram}
                  className="font-display text-2xl hover:text-vermillion"
                >
                  @shopteesng
                </a>
              </div>
            </li>
          </ul>
        </div>

        <ContactForm />
      </section>
    </main>
  );
}
