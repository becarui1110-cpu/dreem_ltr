import Script from "next/script";
import type { Metadata } from "next";
import "./globals.css";
import { ExpiryGuard } from "./expiry-guard";

export const metadata: Metadata = {
  title: "AgentKit demo",
  description: "Demo of ChatKit with hosted workflow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="antialiased">
        {/* protège le front si le token est expiré */}
        <ExpiryGuard />
        {children}
      </body>
    </html>
  );
}
