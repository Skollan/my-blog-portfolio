import Image from "next/image";

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold mb-4">
          Bienvenue sur mon blog
        </h1>
        <p className="text-xl text-gray-600">
          Développeur web passionné par les nouvelles technologies
        </p>
      </section>
    </div>
  );
}
