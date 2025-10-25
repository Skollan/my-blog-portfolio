import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { ThemeProvider } from '@/components/ThemeProvider'
//import analytics
import UmamiAnalytics from '@/components/UmamiAnalytics'

export const metadata = {
  title: {
    default: 'Mon Blog Portfolio',
    template: '%s | Mon Blog Portfolio'
  },
  description: 'Blog personnel et portfolio de projets web',
  keywords: ['blog', 'portfolio', 'développeur web', 'Next.js', 'React'],
  authors: [{ name: 'Ton Nom' }],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://my-blog-portfolio-zeta.vercel.app',
    siteName: 'Mon Blog Portfolio',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Mon Blog Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mon Blog Portfolio',
    description: 'Blog personnel et portfolio de projets web',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`flex flex-col min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white`}>
        <UmamiAnalytics />
        <ThemeProvider>
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}