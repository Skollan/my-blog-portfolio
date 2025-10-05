"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Header() {
  const pathname = usePathname()
  
  const isActive = (path) => {
    if (path === "/") return pathname === "/"
    return pathname.startsWith(path)
  }

  return (
    <header className="border-b">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          MonBlog
        </Link>
        <ul className="flex gap-6">
          <li>
            <Link 
              href="/" 
              className={`hover:text-gray-600 hover:underline ${isActive("/") ? "font-semibold" : ""}`}
            >
              Accueil
            </Link>
          </li>
          <li>
            <Link 
              href="/blog" 
              className={`hover:text-gray-600 hover:underline ${isActive("/blog") ? "font-semibold" : ""}`}
            >
              Blog
            </Link>
          </li>
          <li>
            <Link 
              href="/portfolio" 
              className={`hover:text-gray-600 hover:underline ${isActive("/portfolio") ? "font-semibold" : ""}`}
            >
              Portfolio
            </Link>
          </li>
          <li>
            <Link 
              href="/about" 
              className={`hover:text-gray-600 hover:underline ${isActive("/about") ? "font-semibold" : ""}`}
            >
              À propos
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}