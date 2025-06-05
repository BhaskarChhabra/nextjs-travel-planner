import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/app/globals.css";

import { Providers } from "./providers";
import AppProtector from "./app-protector";
import PageLayout from "./PageLayout";

import Script from "next/script"; // <-- import Script here

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ARKLYTE",
  description: "Your travel companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className={inter.className}>
        {/* Tidio Chat Script */}
        <Script
          src="//code.tidio.co/nvkea3r7zu4zyercactmyi0dktosxuam.js"
          strategy="afterInteractive"
        />
        
        <Providers>
          <PageLayout>{children}</PageLayout>
          <AppProtector />
        </Providers>
      </body>
    </html>
  );
}
