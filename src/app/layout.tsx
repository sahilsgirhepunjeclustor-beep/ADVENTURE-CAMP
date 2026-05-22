
import type {Metadata} from 'next';
// @ts-ignore - CSS side-effect imports are handled by Next.js at build time
import './globals.css';

export const metadata: Metadata = {
  title: 'TrailWise | Professional Expedition Platform',
  description: 'Manage and discover professional wilderness expeditions and adventure camps.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-background text-foreground text-base">
        {children}
      </body>
    </html>
  );
}
