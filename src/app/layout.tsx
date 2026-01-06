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
  title: "FlexEMI - Smart Loan Management",
  description: "The simplest way to track EMIs, manage borrowers, and stay on top of your lending business. No spreadsheets, no confusion—just clarity.",
  keywords: ["loan management", "EMI tracker", "lending", "borrower management", "personal loans", "FlexEMI"],
  authors: [{ name: "FlexEMI" }],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "FlexEMI - Smart Loan Management",
    description: "Manage your personal loans and EMIs efficiently with FlexEMI. Track payments, manage borrowers, and stay organized.",
    type: "website",
    siteName: "FlexEMI",
  },
  twitter: {
    card: "summary",
    title: "FlexEMI - Smart Loan Management",
    description: "The simplest way to track EMIs and manage your lending business.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
