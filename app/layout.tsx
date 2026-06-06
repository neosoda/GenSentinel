import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GenSentinel - Secure Cryptographic Key & Password Generator",
  description:
    "Generate cryptographically secure passwords, API keys, tokens, and technical secrets locally in your browser. 100% client-side generation using Web Crypto API. No tracking, no signup.",
  keywords: [
    "password generator",
    "secure keys",
    "API key generator",
    "UUID generator",
    "JWT secret",
    "random hex",
    "cryptography",
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
