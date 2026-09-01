import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

const steps = [
  {
    number: 1,
    title: "Escolha seu amigo",
    description:
      "Navegue pelos perfis e encontre o animal que mais combina com seu estilo de vida.",
  },
  {
    number: 2,
    title: "Fale com o protetor",
    description:
      "O protetor responsável fará uma conversa para garantir que você e o pet sejam o par perfeito.",
  },
  {
    number: 3,
    title: "Finalize a adoção",
    description:
      "Após a aprovação, assine o termo de responsabilidade e prepare-se para receber muito amor!",
  },
];

export function HowItWorks() {
  return (
    <section id="sobre" className="py-24 bg-primary text-white">
      <Container>
        <SectionHeading
          title="Como funciona o processo de adoção?"
          subtitle="Adotar é um ato de amor, mas também de responsabilidade. Veja os passos:"
          light
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-10 left-0 w-full h-0.5 border-t-2 border-dashed border-white/20 z-0" />
          {steps.map((step) => (
            <div key={step.number} className="relative z-10 text-center">
              <div className="w-20 h-20 bg-accent text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-xl">
                {step.number}
              </div>
              <h3 className="text-xl font-bold mb-4">{step.title}</h3>
              <p className="text-white/70">{step.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
