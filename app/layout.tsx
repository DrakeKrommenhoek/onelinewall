import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Caveat } from "next/font/google";
import AnnouncementBar from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import RevealObserver from "@/components/RevealObserver";
import { DEFAULT_PROMPT, site } from "@/content/site";
import { siteUrl } from "@/lib/siteUrl";
import { getStore } from "@/lib/store";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });
const hand = Caveat({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-caveat", display: "swap" });

// The announcement bar reads this week's prompt; refresh it at most once a minute.
export const revalidate = 60;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${site.name} · W&L`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  openGraph: {
    title: site.name,
    description: site.description,
    type: "website",
    siteName: site.name,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0b2a5b",
};

async function currentPrompt() {
  try {
    return await getStore().getPrompt();
  } catch {
    return DEFAULT_PROMPT;
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const prompt = await currentPrompt();
  return (
    <html lang="en" className={`${display.variable} ${hand.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <AnnouncementBar prompt={prompt} />
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <RevealObserver />
      </body>
    </html>
  );
}
