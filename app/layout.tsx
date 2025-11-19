import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from '@vercel/analytics/react'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://freelance-tax-calculator-six.vercel.app"),
  title: "Free US Freelance Tax Calculator 2025 | Self-Employment Tax Estimator",
  description:
    "Calculate your 2025 freelance taxes instantly. Accurate federal and state tax estimates for self-employed workers and independent contractors. Free, fast, and easy to use.",
  keywords: [
    "freelance tax calculator",
    "self employment tax calculator",
    "1099 tax calculator",
    "quarterly tax estimator",
    "independent contractor taxes",
  ],
  authors: [{ name: "Freelance Tax Calculator" }],
  creator: "Freelance Tax Calculator",
  publisher: "Freelance Tax Calculator",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://freelance-tax-calculator-six.vercel.app",
    title: "Free US Freelance Tax Calculator 2025 | Self-Employment Tax Estimator",
    description:
      "Calculate your 2025 freelance taxes instantly. Accurate federal and state tax estimates for self-employed workers and independent contractors. Free, fast, and easy to use.",
    siteName: "Freelance Tax Calculator",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "US Freelance Tax Calculator 2025",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free US Freelance Tax Calculator 2025 | Self-Employment Tax Estimator",
    description:
      "Calculate your 2025 freelance taxes instantly. Accurate federal and state tax estimates for self-employed workers and independent contractors.",
    images: ["/og-image.png"],
    creator: "@freelancetaxcalc",
  },
  alternates: {
    canonical: "https://freelance-tax-calculator-six.vercel.app",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#4f46e5" },
    { media: "(prefers-color-scheme: dark)", color: "#6366f1" },
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: undefined,
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "US Freelance Tax Calculator 2025",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Free online calculator for estimating 2025 freelance and self-employment taxes. Calculate federal and state taxes, quarterly payments, and take-home income for independent contractors.",
  featureList: [
    "Calculate self-employment tax",
    "Estimate federal income tax",
    "Calculate state income tax",
    "Quarterly payment estimates",
    "Real-time tax calculations",
  ],
  screenshot: "https://freelance-tax-calculator-six.vercel.app/og-image.png",
  url: "https://freelance-tax-calculator-six.vercel.app",
  author: {
    "@type": "Organization",
    name: "Freelance Tax Calculator",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
