"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SessionProvider } from "next-auth/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL || "https://mock-convex-url.local", {
  skipConvexDeploymentUrlCheck: true
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#bafa64" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TreeAI" />
        <title>TreeAI - Tree Service Management</title>
        <meta name="description" content="Professional tree service business management platform with AI-powered operations" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <SessionProvider>
          <ConvexProvider client={convex}>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </ConvexProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
