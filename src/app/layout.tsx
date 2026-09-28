import { Archivo } from "next/font/google";
import "./globals.css";
import { rootMetadata } from "@/lib/seo";
import { organizationJsonLd } from "@/lib/jsonld";

// ONE variable family carries the whole identity, and now literally the
// whole of it: the width axis spans condensed ticker type (wdth 62) through
// body copy (100) to expanded (125), and the weight axis carries the display
// voice at 800. The display serif that used to sit beside this is gone —
// see .font-display in globals.css for why.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
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
      className={`${archivo.variable} h-full antialiased`}
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
