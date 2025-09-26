import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import EthereumWalletProvider from "@/components/wallet/provider";
import Background from "@/components/background";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Game Hub",
  description: "A hub for all your gaming needs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark" lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <EthereumWalletProvider>
          <Background>
            <Navbar
              navItems={[
                { title: "Home", href: "/" },
                { title: "About", href: "/about" },
                { title: "Contact", href: "/contact" },
                { title: "Games", href: "/games" },
                { title: "Editor", href: "/editor" },
                { title: "Market Place", href: "/marketplace" },
                { title: "Community", href: "/community" },
                { title: "🏆 Pyth Dashboard", href: "/pyth-dashboard" },
              ]}
            />
            {children}
            <Toaster />
          </Background>
        </EthereumWalletProvider>
      </body>
    </html>
  );
}
