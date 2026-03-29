import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import { TRPCProvider } from '@/lib/trpc';

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

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
    <html lang="en">
      <body className={dmSans.className}>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
