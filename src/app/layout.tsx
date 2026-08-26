import type { Metadata, Viewport } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import NavigationLoader from "@/components/NavigationLoader";

const lato = Lato({
  weight: ["100", "300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Curve — Real Estate Work & Payment System",
  description: "Enterprise management for real estate project activities, contractor progress, and financial disbursements",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "The Curve",
  },
  icons: {
    icon: [
      { url: "/the-curve-logo.webp", type: "image/webp" },
      { url: "/icon-192.png", sizes: "192x192" },
      { url: "/icon-512.png", sizes: "512x512" },
    ],
    apple: [{ url: "/the-curve-logo.webp" }],
    shortcut: "/the-curve-logo.webp",
  },
};



export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${lato.variable} h-full antialiased font-sans`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__pwaPrompt = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.__pwaPrompt = e;
                window.dispatchEvent(new CustomEvent('pwaPromptReady'));
              });
              window.addEventListener('appinstalled', function() {
                window.__pwaPrompt = null;
                window.dispatchEvent(new CustomEvent('pwaInstalled'));
              });
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">
        <NavigationLoader />
        {children}
      </body>
    </html>
  );
}

