import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { SiteHeader } from '@/components/layout/site-header';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Buscador Técnico',
  description: 'Marketplace técnico com Next.js + NestJS'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <SiteHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
