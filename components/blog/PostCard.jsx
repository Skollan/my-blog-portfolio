import Link from "next/link"
import Image from "next/image"

export default function PostCard({ post }) {
  return (
    <article className="border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
      {post.cover_image && (
        <div className="relative w-full h-48">
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      
      <div className="p-5">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          {new Date(post.created_at).toLocaleDateString("fr-FR")}
        </p>
        
        <h2 className="text-xl font-semibold mb-2">
          <Link href={`/blog/${post.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300 mb-3">{post.excerpt}</p>
        
        {post.tags && (
          <ul className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <li key={tag}>
                <Link
                  href={`/blog?tag=${tag}`}
                  className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  #{tag}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}