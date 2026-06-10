import "./globals.css";
import { Analytics } from '@vercel/analytics/react';
import Script from "next/script";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://pc-master-lms.vercel.app'),
  title: "PC Master Builder | Học Lắp Ráp & Tin Học",
  description: "Ứng dụng học tập tin học và lắp ráp máy tính với công nghệ Hand Tracking.",
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
    ],
    apple: '/logo.png',
  },
  openGraph: {
    title: 'PC Master Builder',
    description: 'Ứng dụng học tập tin học và lắp ráp máy tính với công nghệ Hand Tracking.',
    images: ['/logo.png'],
  }
};

import SessionManager from "@/components/SessionManager";
import { GuruProvider } from "@/lib/guru-state";
import AIGuruGlobal from "@/components/AIGuruGlobal";
import { SessionTimeProvider } from "@/lib/session-time";

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={`${montserrat.variable}`}>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/driver.js@1.0.1/dist/driver.css" />
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var t = localStorage.getItem('theme');
            if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
            else document.documentElement.setAttribute('data-theme', 'light');
          } catch(e) {}
        `}} />
      </head>
      <body className="font-sans">
        <SessionManager />
        <GuruProvider>
          <SessionTimeProvider>
            {children}
            <AIGuruGlobal />
          </SessionTimeProvider>
        </GuruProvider>
        <Analytics />
        <Script src="https://cdn.jsdelivr.net/npm/driver.js@1.0.1/dist/driver.js.iife.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
