import Link from 'next/link'

export default function PostCard({ post }) {
    const { title, slug, excerpt, created_at, cover_image, tags } = post
    const date = new Date(created_at).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    return (
        <li>
            <article className="border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
                {cover_image && (
                    <img
                        src={cover_image}
                        alt={title}
                        className='w-full h-48 object-cover'
                    />
                )}
                <div className='p-5'>
                    <p className="text-sm text-gray-500 mb-1">{date}</p>
                    <h2 className="text-xl font-semibold mb-2">
                        <Link href={`/blog/${slug}`} className='hover:underline'>
                            {title}
                        </Link>
                    </h2>
                    {excerpt &&
                        <p className='text-gray-600 mb-3'>
                            {excerpt}
                        </p>
                    }
                    {tags?.length > 0 && (
                        <ul className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                                <li
                                    key={tag}
                                    className='text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full'
                                >
                                    #{tag}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </article>
        </li>
    )
}