import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://whatsupaddis.io'),
  title: {
    default: "What's Up Addis - Events in Addis Ababa, Ethiopia",
    template: "%s | What's Up Addis",
  },
  description:
    'Discover concerts, conferences, workshops, cultural events, and entertainment happening in Addis Ababa, Ethiopia. Your ultimate guide to events in Ethiopia.',
  keywords: [
    'events in Addis Ababa',
    'Addis Ababa events',
    'events in Ethiopia',
    'what to do in Addis Ababa',
    "what's happening in Addis",
    'concerts in Addis Ababa',
    'workshops in Ethiopia',
    'conferences in Addis',
    'entertainment in Addis Ababa',
    'Ethiopian events',
    'Addis events calendar',
  ],
  authors: [{ name: "What's Up Addis" }],
  creator: "What's Up Addis",
  publisher: "What's Up Addis",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://whatsupaddis.io',
    siteName: "What's Up Addis",
    title: "What's Up Addis - Events in Addis Ababa, Ethiopia",
    description:
      'Discover concerts, conferences, workshops, and entertainment happening in Addis Ababa, Ethiopia.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: "What's Up Addis - Events in Addis Ababa",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "What's Up Addis - Events in Addis Ababa, Ethiopia",
    description:
      'Discover concerts, conferences, workshops, and entertainment happening in Addis Ababa, Ethiopia.',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // You'll need to add this from Google Search Console
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
