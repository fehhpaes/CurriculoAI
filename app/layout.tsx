import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CurrículoAI | Otimize seu currículo com Inteligência Artificial',
  description:
    'Transforme seu currículo com IA. Faça upload do seu PDF e receba em segundos uma versão profissionalmente otimizada, pronta para impressionar recrutadores e passar por sistemas ATS.',
  keywords: ['currículo', 'otimização', 'inteligência artificial', 'ATS', 'recrutamento', 'emprego', 'CV'],
  authors: [{ name: 'CurrículoAI' }],
  openGraph: {
    title: 'CurrículoAI | Otimize seu currículo com IA',
    description: 'Transforme seu currículo com Inteligência Artificial em segundos.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {/* Animated background orbs */}
        <div className="bg-orb bg-orb-1" aria-hidden="true" />
        <div className="bg-orb bg-orb-2" aria-hidden="true" />
        <div className="bg-orb bg-orb-3" aria-hidden="true" />
        <main style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
