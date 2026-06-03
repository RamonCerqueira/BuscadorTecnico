import './globals.css';
import { Outfit } from 'next/font/google';
import { Providers } from './providers';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata = {
  title: 'TechFix Marketplace',
  description: 'Buscador de Técnicos, Empresas e Serviços',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TechFix',
  },
};

export const viewport = {
  themeColor: '#0891b2',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={outfit.className}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <div className="flex-1">
              {children}
            </div>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
