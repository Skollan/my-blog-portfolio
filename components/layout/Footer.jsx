import NewsletterForm from "../common/NewsletterForm"

export default function Footer() {
  return (
    <footer className="border-t dark:border-gray-700 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 mb-6">
          <div>
            <h3 className="font-semibold mb-2">Newsletter</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Recevez les derniers articles dans votre boîte mail
            </p>
            <NewsletterForm />
          </div>
        </div>
        
        <div className="text-center text-gray-600 dark:text-gray-400 pt-6 border-t dark:border-gray-700">
          <p>&copy; {new Date().getFullYear()} MonBlog. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}