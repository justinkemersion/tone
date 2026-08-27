import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/shell/SiteHeader";
import { RegisterSw } from "@/components/pwa/RegisterSw";
import { getAppDisplayName, getAppTagline } from "@/lib/config/app";
import "./globals.css";

export const metadata: Metadata = {
  title: getAppDisplayName(),
  description: getAppTagline(),
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Tone",
    statusBarStyle: "black-translucent",
  },
};

const themeBoot = `(function(){try{var p=JSON.parse(localStorage.getItem("tone-prefs-v1")||"null");var t=(p&&p.theme)||"system";var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light";}catch(e){document.documentElement.dataset.theme="dark";}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body className="antialiased">
        <Providers>
          <RegisterSw />
          <SiteHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
