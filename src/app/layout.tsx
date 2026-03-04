import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: {
    default: 'SubZero — Zero-Touch Subscription Tracking',
    template: '%s | SubZero',
  },
  description:
    'AI-powered subscription management. Connect Gmail, let AI detect your subscriptions, track renewals, and eliminate wasted spend — automatically.',
  keywords: ['subscription manager', 'AI finance', 'Gmail sync', 'subscription tracking', 'spend management'],
  authors: [{ name: 'SubZero' }],
  manifest: '/manifest.json',
  openGraph: {
    title: 'SubZero — Zero-Touch Subscription Tracking',
    description: 'AI-powered subscription management. Track, optimize, and eliminate wasted spend with zero effort.',
    type: 'website',
    siteName: 'SubZero',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SubZero — AI Subscription Manager',
    description: 'Connect Gmail. AI finds your subscriptions. You stay in control.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className="font-sans antialiased">
        <FirebaseClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
