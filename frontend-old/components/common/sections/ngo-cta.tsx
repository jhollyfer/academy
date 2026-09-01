import { Button } from "@/components/ui/button";

export function NgoCta() {
  return (
    <section className="py-20 bg-accent/10 dark:bg-accent/5 border-y border-accent/20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6">
          Representa uma ONG ou é protetor independente?
        </h2>
        <p className="text-slate-700 dark:text-slate-300 text-lg mb-8">
          Cadastre-se gratuitamente para publicar animais para adoção e criar
          vaquinhas verificadas para seus resgatados em Benjamin Constant.
        </p>
        <Button size="lg" className="shadow-lg">
          Cadastrar Minha Instituição
        </Button>
      </div>
    </section>
  );
}
