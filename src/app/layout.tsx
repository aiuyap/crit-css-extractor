import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#1a1a2e' },
    { media: '(prefers-color-scheme: light)', color: '#f8f9fa' },
  ],
};

export const metadata: Metadata = {
  title: 'Critical CSS Extractor',
  description:
    'Extract critical CSS above the fold, optimized for Google PageSpeed Insights and Lighthouse performance scores. Production-ready tool for performance optimization.',
  keywords: [
    'critical-css',
    'performance',
    'lighthouse',
    'pagespeed',
    'nextjs',
    'playwright',
    'css-optimization',
  ],
  authors: [{ name: 'Critical CSS Extractor' }],
  openGraph: {
    title: 'Critical CSS Extractor',
    description:
      'Extract critical CSS above the fold, optimized for Google PageSpeed Insights metrics',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var localTheme = localStorage.getItem('theme');
                  if (localTheme) {
                    document.documentElement.classList.remove('dark', 'light');
                    document.documentElement.classList.add(localTheme);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider defaultTheme="dark">
          <div className="min-h-screen bg-background relative">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
