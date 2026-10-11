import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { APP_CONFIG } from '@/lib/constants';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://randomchat-alpha.vercel.app';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  interactiveWidget: 'resizes-content',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'StrangerSpace — Free Random Text Chat with Strangers (No Login)',
    template: '%s | StrangerSpace',
  },
  description:
    'Talk to random strangers online instantly with StrangerSpace. Free, fast, and anonymous 1-on-1 text chat with no registration, no video required, and zero logs retained.',
  keywords: [
    'random chat',
    'chat with strangers',
    'talk to strangers',
    'stranger chat',
    'anonymous text chat',
    'free random chat',
    'omegle alternative',
    'text chat with strangers',
    'online stranger chat',
    'meet new people online',
  ],
  authors: [{ name: 'StrangerSpace Team' }],
  creator: 'StrangerSpace',
  publisher: 'StrangerSpace',
  applicationName: 'StrangerSpace',
  verification: {
    google: 'veHlAsJJBimNyq4yNLRBbhyNBqiNJk8XbjLyt4wi_6Y',
  },
  alternates: {
    canonical: siteUrl,
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: 'StrangerSpace — Free Random Text Chat with Strangers',
    description:
      'Connect with random strangers worldwide instantly. 100% anonymous, text-only, no registration or personal profile needed.',
    siteName: 'StrangerSpace',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StrangerSpace — Free Random Text Chat with Strangers',
    description:
      'Connect with random strangers worldwide instantly. Free, text-only, and completely anonymous.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'StrangerSpace',
    url: siteUrl,
    description:
      'Free random text chat platform connecting users with strangers instantly with zero registration or logs.',
    applicationCategory: 'CommunicationApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Random text chat with strangers',
      'No registration or profile required',
      'Zero message retention',
      'Skip or Leave anytime',
      'Built-in block and reporting',
    ],
  };

  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white max-w-full overflow-x-clip">
        <Navbar />
        <main className="flex-1 flex flex-col w-full max-w-full overflow-x-clip">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
