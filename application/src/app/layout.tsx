import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from 'context/Providers';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import WithLoadingSpinner from 'components/LoadingSpinner/LoadingSpinner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SaaS App',
  description: 'SaaS App template',
};

/**
 * Root layout de la aplicación.
 * Aplica fuentes globales, estilos base y provee contexto compartido a través del componente Providers.
 *
 * @returns HTML layout con fuentes y providers aplicados.
 */
const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <body
      className={`${geistSans.variable} ${geistMono.variable}`}
      style={{ margin: 0, WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
    >
      <Providers>
        <WithLoadingSpinner>{children}</WithLoadingSpinner>
      </Providers>
    </body>
  </html>
);

export default RootLayout;
