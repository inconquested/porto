import type { Metadata } from "next";
import { Playfair_Display, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";
import StaggeredMenu from "@/components/StaggeredMenu";
import { SiteControls } from "@/components/site-controls";
import { KeyboardNav } from "@/components/keyboard-nav";
import { MagicField } from "@/components/magic-field";
import { SurfaceSpotlight } from "@/components/surface-spotlight";
import { SpellCursor } from "@/components/spell-cursor";

const playfairDisplay = Playfair_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: true,
  fallback: ["Georgia", "serif"],
  adjustFontFallback: true,
});
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://magicworks.dev";
const SITE_NAME = "Magicworks — Muhamad Revan Aulia";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Index.hero");
  const locale = await getLocale();
  const title = "Muhamad Revan Aulia | Magicworks — Fullstack & AI Systems";
  const description = t("subtitle");
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: "%s | Magicworks",
    },
    description,
    keywords: [
      "Muhamad Revan Aulia",
      "Magicworks",
      "fullstack developer",
      "Next.js",
      "React",
      "AI integration",
      "portfolio",
      "Indonesia",
      "web developer",
    ],
    authors: [{ name: "Muhamad Revan Aulia", url: SITE_URL }],
    creator: "Muhamad Revan Aulia",
    publisher: "Magicworks",
    alternates: {
      canonical: "/",
      languages: {
        en: "/en",
        id: "/id",
        de: "/de",
        es: "/es",
        "zh-CN": "/zh-CN",
      },
    },
    openGraph: {
      type: "website",
      locale,
      url: SITE_URL,
      siteName: SITE_NAME,
      title,
      description,
      images: [
        {
          url: "/images/scenery_1.png",
          width: 1200,
          height: 630,
          alt: "Magicworks — archival botanical cover",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/scenery_1.png"],
      creator: "@magicworks",
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
      icon: "/favicon.ico",
      apple: "/logo.svg",
    },
    category: "portfolio",
  };
}

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9f9f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0c" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();
  const locale = await getLocale();
  const t = await getTranslations("Header");

  const menuItems = [
    { label: t("home"), ariaLabel: "Home section", link: "#home" },
    { label: t("about"), ariaLabel: "About section", link: "#about" },
    { label: t("experience"), ariaLabel: "Experience section", link: "#experience" },
    { label: t("project"), ariaLabel: "Projects section", link: "#project" },
    { label: t("skill"), ariaLabel: "Skills section", link: "#skill" },
    { label: t("education"), ariaLabel: "Education section", link: "#education" },
    { label: t("cta"), ariaLabel: "Contact section", link: "#cta" },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Muhamad Revan Aulia",
    alternateName: "Naver",
    url: SITE_URL,
    jobTitle: "Software Developer — Founder, Magicworks",
    address: { "@type": "PostalAddress", addressLocality: "Cimahi", addressCountry: "ID" },
    knowsAbout: ["Next.js", "React", "AI Integration", "System Design", "Fullstack"],
    sameAs: [
      "https://github.com/inconquested",
      "https://www.linkedin.com/in/muhamad-revan-aulia",
      "https://x.com/magicworks.dev",
    ],
  };

  return (
    <html
      lang={locale}
      dir={locale === "ar" || locale === "he" ? "rtl" : "ltr"}
      className={cn(
        "h-full antialiased font-sans",
        playfairDisplay.variable,
        manrope.variable,
        jetbrainsMono.variable,
      )}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      {/* overflow-x-clip (not hidden): hidden turns <body> into its own scroll
           container, which desyncs Lenis's document scroll and cuts the page
           short before the footer's end. clip guards horizontal overflow
           without creating a scroll container. */}
      <body className="min-h-full flex flex-col bg-background text-foreground overflow-x-clip transition-colors duration-500">
        <a
          href="#home"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:border focus:border-accent focus:bg-background focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-foreground"
        >
          Skip to content
        </a>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})()",
          }}
        />
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <div className="crt" aria-hidden="true" />
            <MagicField />

            <div className="fixed top-0 left-0 w-full h-[100dvh] z-40 pointer-events-none">
              <StaggeredMenu
                position="right"
                colors={["#0c0c0c", "#141414"]}
                accentColor="#6366f1"
                menuButtonColor="#6366f1"
                openMenuButtonColor="#6366f1"
                logoUrl="/logo.svg"
                items={menuItems}
                displaySocials={false}
                isFixed={false}
              />
            </div>

            <SiteControls />
            <KeyboardNav />
            <SurfaceSpotlight />
            <SpellCursor />

            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
