import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section id="inicio" className="relative w-full min-h-[600px] flex items-center overflow-hidden">
      <Image
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQSmGWGmQqDdR7IvnfwK2_bEWZx26XonElXaqIzWt3druwT6cQgsay0U4AgdMLvK5D1flakmiewc6vjxBTZGELZEthKkWFAZ4xltdgELdcqeolIyyR3evt6DbAHCwgovWVq2yt2sn9DcyJ8bpSc4WtYYY6x2NIcfJbCA4E7c2oKMf812DgbFg68K5Gekzw7A3Xy8pjEVUkWIjw9kW7mCGyN9bvGv5tvgqQb9ClkYSoyvl8XxQcDFq2xsrJCrhmFtOdgs8uHXveVxx7"
        alt="Cachorro feliz sendo abraçado por uma pessoa em um campo verde"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />

      <Container className="relative z-10 py-20 text-white">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
            Cada patinha merece um lar.
          </h1>
          <p className="text-lg md:text-xl font-medium opacity-90 mb-8 leading-relaxed">
            Adote, denuncie maus-tratos e apoie vaquinhas de animais em Benjamin
            Constant. Juntos podemos transformar vidas.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#adotar">
              <Button size="lg" className="hover:-translate-y-1 shadow-xl">
                Quero Adotar
              </Button>
            </a>
            <a href="#vaquinhas">
              <Button
                variant="ghost"
                size="lg"
                className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30"
              >
                Ver Vaquinhas
              </Button>
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
