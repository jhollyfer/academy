import { PawPrint, Facebook, Instagram, Youtube } from "lucide-react";
import { Container } from "@/components/ui/container";

const platformLinks = [
  { label: "Encontrar Pet", href: "#adotar" },
  { label: "Criar Vaquinha", href: "#vaquinhas" },
  { label: "Denunciar Maus-tratos", href: "#denunciar" },
  { label: "Protetores Parceiros", href: "#sobre" },
];

const institutionalLinks = [
  { label: "Sobre Nós", href: "#sobre" },
  { label: "Transparência", href: "#" },
  { label: "Termos de Uso", href: "#" },
  { label: "Contato", href: "#" },
];

const socialLinks = [
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Youtube, label: "YouTube", href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-surface dark:bg-background-dark pt-16 pb-8 border-t border-border dark:border-border-dark">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <PawPrint className="h-7 w-7 text-primary" />
              <span className="text-primary text-xl font-bold tracking-tight">
                Patinhas na Rua
              </span>
            </div>
            <p className="text-muted dark:text-muted-dark text-sm leading-relaxed">
              Transformando a realidade do bem-estar animal em Benjamin Constant
              através da tecnologia e solidariedade.
            </p>
          </div>

          <div>
            <h5 className="font-bold mb-6">Plataforma</h5>
            <ul className="space-y-4 text-sm text-muted dark:text-muted-dark">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-bold mb-6">Institucional</h5>
            <ul className="space-y-4 text-sm text-muted dark:text-muted-dark">
              {institutionalLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-bold mb-6">Siga-nos</h5>
            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  aria-label={link.label}
                  className="w-10 h-10 rounded-full bg-primary/5 dark:bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <link.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border dark:border-border-dark text-center text-muted dark:text-muted-dark text-xs">
          <p>
            &copy; {new Date().getFullYear()} Patinhas na Rua. Todos os direitos
            reservados. Feito com amor pelos animais de Benjamin Constant.
          </p>
        </div>
      </Container>
    </footer>
  );
}
