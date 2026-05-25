import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "../context/ThemeContext";
import "./globals.css";

const sansFont = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Synapse — Terminal Survival",
  description:
    "Cyberpunk survival scenarios để luyện phrasal verbs trong terminal brutalist.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${sansFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0a]">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
