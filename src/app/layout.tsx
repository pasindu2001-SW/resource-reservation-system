import type { Metadata } from 'next';
import './globals.css';
import { UserProvider } from '@/context/UserContext';

export const metadata: Metadata = {
  title: 'Resource Reservation System | PrimeWave Lab',
  description: 'Shared resource and booking coordination system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-800 min-h-screen antialiased">
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}