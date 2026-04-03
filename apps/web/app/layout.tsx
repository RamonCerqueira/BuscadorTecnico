import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Buscador Técnico',
  description: 'Marketplace técnico com Next.js + NestJS'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
