import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeBoot } from "@/components/theme-boot";
import "./globals.css";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "SPARS ERP – Kalpna Traders Company Management",
  description: "Enterprise company management for Kalpna Traders: CRM, inventory, purchase, payroll, dealer portal and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${font.variable} font-sans`}>
        <ThemeBoot />
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
