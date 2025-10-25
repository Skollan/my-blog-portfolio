import ContactForm from "@/components/common/ContactForm";

export const metadata = {
  title: "Contact",
  description: "Contactez-moi pour vos projets ou questions",
};

export default function Contact() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">Contact</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Une question, un projet ? N’&amps;’hésitez pas à me contacter !
      </p>

      <ContactForm />
    </div>
  );
}
