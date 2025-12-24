import { Space_Grotesk, Fraunces, JetBrains_Mono } from 'next/font/google';
import Sidebar from '@/components/sidebar';
import Topbar from '@/components/topbar';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata = {
  title: {
    default: 'TalentVault',
    template: '%s | TalentVault',
  },
  description: 'Talent intelligence and hiring operations command center.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${fraunces.variable} ${jetBrainsMono.variable} font-sans antialiased`}
      >
        <div className="relative min-h-screen">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,_rgba(250,214,165,0.6),_transparent_45%),radial-gradient(circle_at_80%_10%,_rgba(143,196,200,0.35),_transparent_45%),radial-gradient(circle_at_50%_80%,_rgba(221,194,169,0.55),_transparent_50%)]" />
          <div className="relative z-10 flex min-h-screen">
            <Sidebar />
            <div className="flex-1 px-4 py-6 lg:px-10 lg:py-10">
              <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col gap-8 rounded-[32px] border border-black/5 bg-white/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.15)] backdrop-blur">
                <Topbar />
                <main className="flex flex-1 flex-col gap-8">{children}</main>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
