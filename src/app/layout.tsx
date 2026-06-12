import { Archivo, Martian_Mono } from "next/font/google";
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

// Machine-printed mono for prices, SKUs, stamps and metadata.
const martianMono = Martian_Mono({
  variable: "--font-martian",
  subsets: ["latin"],
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
      className={`${archivo.variable} ${martianMono.variable} h-full antialiased`}
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
