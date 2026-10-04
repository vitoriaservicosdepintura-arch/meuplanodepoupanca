import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import ServiceWorker from "@/components/ServiceWorker";

export const metadata: Metadata = {
  title: "Meu Plano de Poupança",
  description: "Controle pessoal e privado da poupança semanal até 20/12/2026.",
  manifest: "/manifest.webmanifest",
  applicationName: "Meu Plano de Poupança",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Poupança",
  },
  icons: {
    icon: "/icons/icon-512.png",
    apple: "/icons/icon-512.png",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#070b14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh bg-[#070b14] text-slate-100 antialiased">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
