import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from './Providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Internshala — Search Internships',
  description: 'Search thousands of internships across India.',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-[#F6F7F8] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
