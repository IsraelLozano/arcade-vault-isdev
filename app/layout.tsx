import type { Metadata } from "next";
import { Press_Start_2P, JetBrains_Mono } from "next/font/google";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { SessionProvider } from "@/components/session-provider";
import "./globals.css";

const pixel = Press_Start_2P({
  variable: "--font-pixel",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Arcade Vault",
  description: "Juga arcades online y competí por el puntaje más alto.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${pixel.variable} ${mono.variable}`}>
      <body>
        <div className="av-bg" aria-hidden />
        <div className="av-noise" aria-hidden />
        <div id="root">
          <SessionProvider>
            <Nav />
            <main className="av-main">{children}</main>
            <Footer />
          </SessionProvider>
        </div>
      </body>
    </html>
  );
}
