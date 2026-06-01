import type { Metadata, Viewport } from "next";
import { Orbitron, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

// Cyberpunk-style fonts
const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "LEXICA - IELTS Vocabulary Swiper",
  description: "Master IELTS vocabulary through addictive swipe-based micro-learning. The fastest way to level up your English.",
  keywords: ["IELTS", "vocabulary", "English learning", "flashcards", "education"],
  authors: [{ name: "ORATIO" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LEXICA",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icon-192.svg",
    apple: "/icon-192.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-900 text-white overflow-x-hidden" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
