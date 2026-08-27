import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { getAppDisplayName, getAppTagline } from "@/lib/config/app";
import "./globals.css";

export const metadata: Metadata = {
  title: getAppDisplayName(),
  description: getAppTagline(),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
