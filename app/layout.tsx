import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import { AnalyticsProvider } from "@/app/components/analytics-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mini‑SaaS",
  description: "Plantilla Mini‑SaaS con Next.js, Prisma, NextAuth y Stripe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <html lang="es">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <Providers>
          <AnalyticsProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <div className="flex-1">{children}</div>
              <Footer />
            </div>
          </AnalyticsProvider>
        </Providers>
      </body>
    </html>
  );
}
