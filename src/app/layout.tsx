import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistPixelSquare } from "geist/font/pixel/square";
import { GeistSans } from "geist/font/sans";
import CursorGate from "@/components/cursor-gate";
import ScrollStory from "@/components/scroll-story";
import Spotlight from "@/components/spotlight";
import { site, socials } from "@/data/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: site.title,
    description: site.description,
    url: site.url,
    siteName: site.title,
    type: "website",
    locale: "en",
    images: [{ url: `${site.url}/og.png`, width: 1200, height: 630, alt: site.title }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: [`${site.url}/og.png`],
  },
  icons: {
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark",
};

/* Only what the page itself states: the name it uses, the URL, and the linked profiles. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "KT",
  alternateName: "Tan",
  url: site.url,
  description: site.description,
  sameAs: socials.map((social) => social.href),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${GeistPixelSquare.variable}`}>
      <body>
        <ScrollStory />
        <CursorGate />
        <Spotlight />
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
