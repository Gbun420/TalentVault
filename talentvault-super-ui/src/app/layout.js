import { Space_Grotesk, Fraunces, JetBrains_Mono } from 'next/font/google';
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
        {children}
      </body>
    </html>
  );
}
