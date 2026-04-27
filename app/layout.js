import "./globals.css";
import Script from "next/script";
import { Plus_Jakarta_Sans, Inter, Playfair_Display } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-plus-jakarta",
});

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-serif",
});

export const metadata = {
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

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/driver.js@1.0.1/dist/driver.css" />
      </head>
      <body className="font-sans">
        {children}
        <Script src="https://cdn.jsdelivr.net/npm/driver.js@1.0.1/dist/driver.js.iife.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
