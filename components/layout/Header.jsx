import Link from 'next/link'

export default function Header() {
  return (
    <header className="border-b">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          MonBlog
        </Link>
        <ul className="flex gap-6">
          <li><Link href="/" className="hover:text-gray-600 hover:underline">Accueil</Link></li>
          <li><Link href="/blog" className="hover:text-gray-600 hover:underline">Blog</Link></li>
          <li><Link href="/about" className="hover:text-gray-600 hover:underline">À propos</Link></li>
        </ul>
      </nav>
    </header>
  )
}