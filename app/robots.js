export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/',
    },
    sitemap: 'https://my-blog-portfolio-zeta.vercel.app/sitemap.xml',
  }
}