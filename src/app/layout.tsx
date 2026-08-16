import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import CursorAmbient from "./cursor-ambient";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tan — Developer & AI Builder",
  description: "Personal portfolio exploring software, physical vision, and multi-agent AI systems.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <CursorAmbient />
        {children}
      </body>
    </html>
  );
}
