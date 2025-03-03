import React from 'react';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import ThemeProvider from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Awesome List Manager',
  description: 'A web application for generating, managing, and maintaining awesome lists on GitHub',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
