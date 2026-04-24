import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/SiteFooter";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  weight: ["400", "500", "600", "700"],
});
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Aurora · Argumentarios desde distintas corrientes ideológicas",
  description:
    "Herramienta educativa para explorar cómo un mismo tema puede argumentarse desde distintas corrientes ideológicas. Un ejercicio dialéctico para el aula.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-sans min-h-screen flex flex-col bg-paper text-ink">
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
