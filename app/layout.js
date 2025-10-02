import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
})

export const metadata = {
  title: "Mon portfolio",
  description: "Blog personnel et portfolio de projets",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={'${outfit.className} flex flex-col min-h-screen'}>
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
