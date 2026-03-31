import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TRPCProvider } from '@/lib/trpc';
import { ThemeProvider } from '@/components/theme-provider';
import { I18nProvider } from '@/lib/i18n';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAF9' },
    { media: '(prefers-color-scheme: dark)', color: '#1C1917' },
  ],
};

export const metadata: Metadata = {
  title: 'Reels — Film-Driven Social Matching',
  description: 'Connect with people who share your film taste. Import your Letterboxd, discover 10 curated matches daily, and meet fellow cinephiles.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Reels',
  },
  icons: {
    apple: '/icons/icon-180.svg',
    icon: '/icons/icon-192.svg',
  },
  openGraph: {
    title: 'Reels — Film-Driven Social Matching',
    description: 'Connect with people who share your film taste.',
    type: 'website',
    locale: 'en_US',
  },
};

// Inline script to prevent FOUC — applies theme class before React hydrates
const themeScript = `(function(){try{var t=localStorage.getItem('reels-theme');var d=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.classList.add(d?'dark':'light')}catch(e){}})()`;

// Service worker registration script
const swScript = `(function(){if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(e){console.warn('SW registration failed',e)})})}})()`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: swScript }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <I18nProvider>
            <TRPCProvider>{children}</TRPCProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
