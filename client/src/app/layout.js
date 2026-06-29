import ClientLayout from '@/components/ClientLayout';
import './globals.css';

export const metadata = {
  title: 'Aequitas AI - Premium Equity Intelligence',
  description: 'Instant institutional-grade stock and equity analysis powered by LangGraph & Gemini.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-slate-950 text-slate-100">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col lg:flex-row bg-slate-950 font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
