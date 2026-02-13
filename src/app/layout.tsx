import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { DebugPanel } from "@/components/common/debug-panel/debug-panel";
import { AuthProvider } from "@/components/common/auth-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export const metadata: Metadata = {
  title: { default: "Tugboat", template: "%s | Tugboat" },
  description:
    "A living record of your belongings",
  other: {
    "font-stylesheet": "/fonts/switzer/css/switzer.css",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/fonts/switzer/css/switzer.css" />
      </head>
      <body className="antialiased">
        <NuqsAdapter>
          <AuthProvider>
            {children}
            <Toaster />
            <DebugPanel />
          </AuthProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
