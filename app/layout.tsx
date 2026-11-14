import type { Metadata } from "next";
import { Doto, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";

const doto = Doto({
  variable: "--font-pixel-doto",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ui.up2px.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "up2px UI — Aesthetic React & Next.js Components",
    template: "%s | up2px UI",
  },
  description:
    "Open-source, motion-rich React and Next.js components built with Tailwind CSS and Motion. Copy, paste, or install via shadcn CLI with full code ownership.",
  applicationName: "up2px UI",
  authors: [{ name: "up2px", url: "https://up2px.com" }],
  creator: "up2px",
  publisher: "up2px",
  keywords: [
    "up2px UI",
    "React UI components",
    "Next.js components",
    "Tailwind CSS components",
    "Motion components",
    "shadcn registry",
    "copy paste UI components",
    "animated React components",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "up2px UI — Aesthetic React & Next.js Components",
    description:
      "Motion-rich, copy-paste React and Next.js components built with Tailwind CSS and Motion. Full code ownership.",
    siteName: "up2px UI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "up2px UI — Aesthetic Components, Crafted To The Pixel.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "up2px UI — Aesthetic React & Next.js Components",
    description:
      "Motion-rich, copy-paste React and Next.js components built with Tailwind CSS and Motion.",
    creator: "@up2px",
    site: "@up2px",
    images: ["/og-image.png"],
  },
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/square-logo.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "up2px UI",
      description:
        "Open-source React and Next.js component library built with Tailwind CSS and Motion.",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "up2px",
      url: "https://up2px.com",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${doto.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full w-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
