import { Archivo, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { rootMetadata } from "@/lib/seo";
import { organizationJsonLd } from "@/lib/jsonld";

// One variable family carries the whole identity: the width axis spans
// condensed ticker type (wdth 62) to ultra-expanded display (wdth 125).
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

// Display serif, headlines only — hero, banner blocks, page titles.
//
// The headline voice is the single biggest thing separating this from a
// fashion storefront: a compressed grotesque reads as a poster, a serif
// reads as a house. Instrument Serif is one weight, ~20 KB, and high
// enough in contrast to carry a headline at 5rem without extra weight.
//
// It does NOT add a family. The mono it replaces (Azeret, three weights)
// was heavier than this, and the reference this is built against uses no
// mono at all — labels there are small sans. So the count stays at two and
// the byte total goes down.
const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  // Normal only. The italic was being preloaded at ~15 KB and nothing on
  // the site sets it — the one italic voice, .font-italic-accent, is
  // Archivo, not the serif.
  display: "swap",
});

export const metadata = rootMetadata;

// Root layout: html/body/fonts only. Public pages get header/footer via
// (public)/layout.tsx. Admin pages get the sidebar via admin/(authed)/layout.tsx.
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-paper text-ink flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        {children}
      </body>
    </html>
  );
}
