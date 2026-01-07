import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'sonner';
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "aSpot - Smart Travel Planning",
  description: "Plan your perfect trip with AI-powered recommendations and collaborative itinerary building",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased font-sans">
          <Providers>
            {children}
          </Providers>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}

