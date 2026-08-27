import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import NavigationLoader from "@/components/NavigationLoader";

const roboto = Roboto({
  weight: ["300", "400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-roboto",
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
      { url: "/icon.png", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/the-curve-logo.webp",
  },
};




export const viewport: Viewport = {
  themeColor: "#f8f9fc",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${roboto.variable} h-full antialiased font-sans`}>
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

