import { Archivo, Azeret_Mono } from "next/font/google";
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

// Machine-printed mono for prices, SKUs, archive refs and metadata.
//
// Azeret rather than the Martian Mono this replaces: Martian is an unusually
// WIDE mono, which made every label run long on a 375px screen and turned to
// mush at label sizes. Azeret is narrower and squarer, so the same metadata
// fits and still reads. A swap, not an addition — fonts are already the
// heaviest thing this site ships (138 KB, more than its imagery), so the
// family count stays at two.
const azeretMono = Azeret_Mono({
  variable: "--font-azeret",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
      className={`${archivo.variable} ${azeretMono.variable} h-full antialiased`}
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
