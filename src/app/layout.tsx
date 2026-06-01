import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import PwaRegister from "@/components/PwaRegister";
import { THEME_INIT_SCRIPT } from "@/lib/useTheme";
import { BASE_PATH } from "@/lib/basePath";

// Distinctive, rounded, toy-like display face + a warm readable body face.
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "YappoZappo — Great conversations start here",
  description:
    "A playful family conversation game for dinners, road trips, youth groups, and devotions. Tap a color, hear a question, and start talking.",
  applicationName: "YappoZappo",
  manifest: `${BASE_PATH}/manifest.json`,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "YappoZappo",
  },
  icons: {
    icon: [
      { url: `${BASE_PATH}/icons/icon-192.png`, sizes: "192x192", type: "image/png" },
      { url: `${BASE_PATH}/icons/icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: `${BASE_PATH}/icons/apple-touch-icon.png`, sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#fff3e6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Set the theme before paint to prevent a flash of the wrong mode. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={`${fredoka.variable} ${nunito.variable} font-body`}>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
