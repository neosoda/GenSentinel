import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono, Orbitron } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GenSentinel - Générateur de clés et secrets cryptographiques côté client",
  description:
    "Générez des mots de passe, clés d'API, UUID, secrets JWT et jetons cryptographiques localement dans votre navigateur. 100 % côté client via Web Crypto API. Zéro tracking, sans inscription.",
  keywords: [
    "générateur de mot de passe",
    "clés sécurisées",
    "clé API",
    "UUID v4",
    "secret JWT",
    "hexadécimal",
    "cryptographie",
    "Web Crypto API",
  ],
  authors: [{ name: "GenSentinel" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      data-theme="light"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} ${orbitron.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-150">
        {children}
      </body>
    </html>
  );
}
