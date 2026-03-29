import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TRPCProvider } from '@/lib/trpc';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Reels — Film-Driven Social Matching',
  description: 'Connect with people who share your film taste',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
