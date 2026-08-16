import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { ThemeProvider } from 'next-themes';
import './globals.css';
import { SITE_CONFIG } from '@/data';

// Use robust system font stacks so production builds never depend on
// downloading Google Fonts at build time.
const fontVariables = {
  '--font-syne': '"Trebuchet MS", "Segoe UI", Arial, sans-serif',
  '--font-inter': 'Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  '--font-jetbrains': 'ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", monospace',
} as CSSProperties;

export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} — PhD Researcher, Multimodal Code Generation & NLP | IIT Bombay`,
  description: SITE_CONFIG.description,
  keywords: SITE_CONFIG.keywords,
  authors: [{ name: SITE_CONFIG.name }],
  creator: SITE_CONFIG.name,
  openGraph: {
    title: `${SITE_CONFIG.name} — PhD Researcher, IIT Bombay`,
    description: SITE_CONFIG.description,
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: `${SITE_CONFIG.name} — PhD Researcher, IIT Bombay`,
    description: SITE_CONFIG.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={fontVariables}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
