import { Inter } from 'next/font/google';
import ClientLayout from '@/components/ClientLayout';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'Aequitas AI - Premium Equity Intelligence',
  description: 'Instant institutional-grade stock and equity analysis powered by LangGraph & Gemini.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`h-full bg-slate-950 text-slate-100 ${inter.variable}`}>
      <body className="min-h-full flex flex-col lg:flex-row bg-slate-950 font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
