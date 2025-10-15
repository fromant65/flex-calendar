import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { Navbar } from "~/components/navbar";
import { Providers } from "~/components/providers";

export const metadata: Metadata = {
  title: "Flex Calendar",
  description: "A flexible calendar application to manage your time and tasks.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.toggle('dark', theme === 'dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="h-screen overflow-hidden bg-background text-foreground">
        <Providers>
          <TRPCReactProvider>
            <div className="flex h-full flex-col">
              <div className="shrink-0">
                <Navbar />
              </div>
              <main className="flex-1 overflow-scroll min-h-0">
                {children}
              </main>
            </div>
          </TRPCReactProvider>
        </Providers>
      </body>
    </html>
  );
}
