import { PawPrint, ShieldCheck, Heart } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

const features = [
  {
    icon: PawPrint,
    title: "Adoção Responsável",
    description:
      "Conectamos você a protetores verificados e animais que esperam por um novo lar cheio de amor em Benjamin Constant.",
    iconBg: "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white",
  },
  {
    icon: ShieldCheck,
    title: "Denúncia Protegida",
    description:
      "Um canal seguro para reportar casos de maus-tratos diretamente às autoridades e protetores locais da cidade.",
    iconBg: "bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white",
  },
  {
    icon: Heart,
    title: "Vaquinhas Solidárias",
    description:
      "Ajude a custear tratamentos, cirurgias e ração para animais resgatados que ainda não têm um lar.",
    iconBg: "bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white",
  },
];

export function Features() {
  return (
    <section id="denunciar" className="py-24">
      <Container>
        <SectionHeading
          title="Como ajudamos os animais"
          subtitle="Nossa plataforma conecta quem quer ajudar com quem precisa de auxílio, garantindo transparência e segurança."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-surface dark:bg-surface-dark p-8 rounded-2xl shadow-sm border border-border dark:border-border-dark hover:shadow-xl transition-shadow group"
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors ${feature.iconBg}`}
              >
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted dark:text-muted-dark leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
