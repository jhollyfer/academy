import { apiFetch } from "@/lib/api";
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  Code,
  FileText,
  Infinity,
  Layers,
  Play,
  Terminal,
  TrendingUp,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "academy — Aprenda programação do zero",
  description:
    "Plataforma educacional com aulas interativas de programação, banco de dados e informática. Quizzes em tempo real, exercícios práticos e conteúdo gratuito.",
};

interface CourseData {
  slug: string;
  label: string;
  language: string;
  lessonCount: number;
  moduleCount: number;
}

const cursos = [
  {
    id: "logica-programacao-typescript",
    titulo: "Lógica de Programação",
    linguagem: "TypeScript" as const,
    descricao: "Fundamentos essenciais para qualquer linguagem de programação.",
    status: "disponivel" as const,
    href: "/logica-programacao-typescript/lessons",
    icon: Code,
  },
  {
    id: "logica-programacao-python",
    titulo: "Lógica de Programação",
    linguagem: "Python" as const,
    descricao:
      "Os mesmos fundamentos, agora com a linguagem mais popular do mundo.",
    status: "disponivel" as const,
    href: "/logica-programacao-python/lessons",
    icon: Code,
  },
  {
    id: "informatica-avancada-word",
    titulo: "Informática Avançada",
    linguagem: "Word" as const,
    descricao:
      "Domine o Microsoft Word: formatação profissional, tabelas, mala direta e documentos ABNT.",
    status: "disponivel" as const,
    href: "/informatica-avancada-word/lessons",
    icon: FileText,
  },
  {
    id: "empreendedorismo",
    titulo: "Empreendedorismo",
    linguagem: "Saúde" as const,
    descricao:
      "Desenvolva mentalidade empreendedora e aprenda a identificar oportunidades na área da saúde.",
    status: "disponivel" as const,
    href: "/empreendedorismo/lessons",
    icon: TrendingUp,
  },
  {
    id: "banco-de-dados",
    titulo: "Banco de Dados",
    linguagem: "SQL" as const,
    descricao: "Aprenda a modelar, estruturar e consultar dados com SQL.",
    status: "disponivel" as const,
    href: "/banco-de-dados/lessons",
    icon: Layers,
  },
  {
    id: "engsoft",
    titulo: "Engenharia de Software",
    linguagem: null as string | null,
    descricao:
      "Padrões de projeto, arquitetura e boas práticas de desenvolvimento.",
    status: "em-breve" as const,
    href: "#",
    icon: Layers,
  },
  {
    id: "web",
    titulo: "Desenvolvimento Web",
    linguagem: null as string | null,
    descricao: "Construa aplicações modernas com HTML, CSS, React e Next.js.",
    status: "em-breve" as const,
    href: "#",
    icon: Terminal,
  },
];

export default async function Home() {
  let coursesData: CourseData[] = [];
  try {
    const res = await apiFetch<{ courses: CourseData[] }>("/api/courses");
    console.log("Fetched courses:", res.courses);
    coursesData = res.courses;
  } catch {
    // fallback if backend not available
  }

  const courseMap = new Map(coursesData.map((c) => [c.slug, c]));
  const totalLessons = coursesData.reduce((sum, c) => sum + c.lessonCount, 0);
  const totalModules = coursesData.reduce((sum, c) => sum + c.moduleCount, 0);

  return (
    <div className="grid-bg relative z-10">
      <main className="min-h-screen" id="inicio">
        {/* Hero */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col items-start gap-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-mono font-bold tracking-widest uppercase rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-success)] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-success)]" />
                </span>
                Plataforma educacional
              </div>
              <h1 className="text-6xl md:text-7xl font-extrabold leading-[1.1] tracking-tight">
                Tech <span className="text-[var(--color-primary)]">Class</span>
              </h1>
              <p className="text-lg md:text-xl text-[var(--color-muted)] max-w-lg leading-relaxed">
                Aprenda programação do zero ao avançado com uma metodologia
                prática, focada no mercado e em projetos reais.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/logica-programacao-typescript/lessons"
                  className="bg-[var(--color-primary)] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-[var(--color-primary)]/25 hover:scale-[1.02] transition-transform"
                >
                  Começar agora
                </Link>
                <a
                  href="#cursos"
                  className="border-2 border-[var(--color-border)] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[var(--color-surface)] transition-colors"
                >
                  Ver cursos
                </a>
              </div>
            </div>

            {/* Terminal mockup */}
            <div className="relative group hidden lg:block">
              <div className="absolute -inset-4 bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent)] opacity-20 blur-3xl rounded-full" />
              <div className="relative bg-[oklch(0.12_0.02_265)] border border-[oklch(0.23_0.015_265)] rounded-xl shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[oklch(0.23_0.015_265)] bg-[oklch(0.16_0.02_265)]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="mx-auto text-[10px] font-mono text-[oklch(0.5_0.01_265)] uppercase tracking-widest">
                    terminal — app.ts
                  </div>
                </div>
                <div className="p-6 font-mono text-sm leading-relaxed text-[oklch(0.9_0.005_265)]">
                  <div className="flex gap-4">
                    <span className="text-[oklch(0.4_0.01_265)]">01</span>
                    <p>
                      <span className="text-[var(--color-primary)]">
                        import
                      </span>{" "}
                      {"{ learn }"}{" "}
                      <span className="text-[var(--color-primary)]">from</span>{" "}
                      <span className="text-[var(--color-success)]">
                        &quot;academy&quot;
                      </span>
                      ;
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-[oklch(0.4_0.01_265)]">02</span>
                    <p>&nbsp;</p>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-[oklch(0.4_0.01_265)]">03</span>
                    <p>
                      <span className="text-[var(--color-primary)]">const</span>{" "}
                      <span className="text-[var(--color-accent)]">
                        student
                      </span>{" "}
                      = {"{"}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-[oklch(0.4_0.01_265)]">04</span>
                    <p className="ml-4">
                      name:{" "}
                      <span className="text-[var(--color-success)]">
                        &quot;Você&quot;
                      </span>
                      ,
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-[oklch(0.4_0.01_265)]">05</span>
                    <p className="ml-4">
                      level:{" "}
                      <span className="text-[var(--color-warning)]">0</span>,
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-[oklch(0.4_0.01_265)]">06</span>
                    <p>{"};"}</p>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-[oklch(0.4_0.01_265)]">07</span>
                    <p>&nbsp;</p>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-[oklch(0.4_0.01_265)]">08</span>
                    <p>
                      learn(student);{" "}
                      <span className="text-[oklch(0.4_0.01_265)]">
                        // career_ready!
                      </span>
                    </p>
                  </div>
                  <div className="mt-6 flex gap-4">
                    <span className="text-[oklch(0.4_0.01_265)]">&gt;&gt;</span>
                    <p className="text-[var(--color-accent)] animate-pulse">
                      _
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-10 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
            <div className="flex items-center gap-6">
              <div className="size-14 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                <BookOpen size={28} />
              </div>
              <div>
                <p className="font-mono text-3xl font-bold leading-none mb-1">
                  {totalLessons || "—"}
                </p>
                <p className="text-sm text-[var(--color-muted)] uppercase font-bold tracking-tight">
                  Aulas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 md:border-x border-[var(--color-border)] md:px-12">
              <div className="size-14 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)]">
                <Layers size={28} />
              </div>
              <div>
                <p className="font-mono text-3xl font-bold leading-none mb-1">
                  {String(totalModules || 0).padStart(2, "0")}
                </p>
                <p className="text-sm text-[var(--color-muted)] uppercase font-bold tracking-tight">
                  Módulos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="size-14 rounded-lg bg-[var(--color-success)]/10 flex items-center justify-center text-[var(--color-success)]">
                <Infinity size={28} />
              </div>
              <div>
                <p className="font-mono text-3xl font-bold leading-none mb-1">
                  Infinito
                </p>
                <p className="text-sm text-[var(--color-muted)] uppercase font-bold tracking-tight">
                  Prática
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 border-l-4 border-[var(--color-primary)] bg-[var(--color-surface)] rounded-r-xl">
              <Play size={32} className="text-[var(--color-primary)] mb-4" />
              <h3 className="text-xl font-bold mb-3">Aulas Interativas</h3>
              <p className="text-[var(--color-muted)]">
                Conteúdo dinâmico com diagramas, tabelas verdade e quizzes
                integrados no navegador.
              </p>
            </div>
            <div className="p-8 border-l-4 border-[var(--color-accent)] bg-[var(--color-surface)] rounded-r-xl">
              <TrendingUp
                size={32}
                className="text-[var(--color-accent)] mb-4"
              />
              <h3 className="text-xl font-bold mb-3">Do Zero ao Avançado</h3>
              <p className="text-[var(--color-muted)]">
                Trilha completa: dos fundamentos até projetos de programação em
                TypeScript.
              </p>
            </div>
            <div className="p-8 border-l-4 border-[var(--color-success)] bg-[var(--color-surface)] rounded-r-xl">
              <Terminal
                size={32}
                className="text-[var(--color-success)] mb-4"
              />
              <h3 className="text-xl font-bold mb-3">Prática Real</h3>
              <p className="text-[var(--color-muted)]">
                Desenvolva projetos do mundo real: jogos, calculadoras e
                aplicações interativas.
              </p>
            </div>
          </div>
        </section>

        {/* Cursos */}
        <section id="cursos" className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-4xl font-extrabold mb-4">
                Trilhas de Aprendizado
              </h2>
              <p className="text-[var(--color-muted)] max-w-xl">
                Escolha seu caminho e comece a dominar as tecnologias mais
                requisitadas do mercado atual.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {cursos.map((curso) => {
              const disponivel = curso.status === "disponivel";
              if (disponivel) {
                return (
                  <Link
                    key={curso.id}
                    href={curso.href}
                    className="group relative bg-[var(--color-surface)] border border-[var(--color-border)] p-8 rounded-xl hover:border-[var(--color-primary)] transition-colors"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg">
                        <curso.icon size={28} />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-[var(--color-success)]/10 text-[var(--color-success)] text-xs font-bold uppercase tracking-widest border border-[var(--color-success)]/20">
                        Disponível
                      </span>
                    </div>
                    <h4 className="text-2xl font-bold mb-2 group-hover:text-[var(--color-primary)] transition-colors">
                      {curso.titulo}
                    </h4>
                    {curso.linguagem && (
                      <span className="inline-block px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20 mb-3">
                        {curso.linguagem}
                      </span>
                    )}
                    <p className="text-[var(--color-muted)] mb-6">
                      {curso.descricao}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-[var(--color-muted)] font-semibold font-mono">
                      <span className="flex items-center gap-1.5">
                        <BookOpen size={16} />
                        {courseMap.get(curso.id)?.lessonCount ?? "—"} aulas
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Layers size={16} />
                        {courseMap.get(curso.id)?.moduleCount ?? "—"} módulos
                      </span>
                    </div>
                  </Link>
                );
              }
              return (
                <div
                  key={curso.id}
                  className="opacity-60 bg-[var(--color-surface)]/50 border border-dashed border-[var(--color-border)] p-8 rounded-xl"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-[var(--color-muted)]/10 text-[var(--color-muted)] rounded-lg">
                      <curso.icon size={28} />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[var(--color-muted)]/10 text-[var(--color-muted)] text-xs font-bold uppercase tracking-widest">
                      Em breve
                    </span>
                  </div>
                  <h4 className="text-2xl font-bold mb-2">{curso.titulo}</h4>
                  {curso.linguagem && (
                    <span className="inline-block px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-[var(--color-muted)]/10 text-[var(--color-muted)] border border-[var(--color-muted)]/20 mb-3">
                      {curso.linguagem}
                    </span>
                  )}
                  <p className="text-[var(--color-muted)] mb-6">
                    {curso.descricao}
                  </p>
                  <div className="h-2 bg-[var(--color-border)] rounded-full w-full" />
                </div>
              );
            })}
          </div>
        </section>

        {/* Aprenda fazendo */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="bg-[var(--color-primary)]/5 rounded-3xl p-8 md:p-16">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
                  Aprenda fazendo
                </h2>
                <p className="text-xl text-[var(--color-muted)] leading-relaxed">
                  Nossa plataforma foi construída para você praticar enquanto
                  aprende. Sem configurações complexas, comece a codar direto no
                  browser.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 font-semibold">
                    <CheckCircle
                      size={20}
                      className="text-[var(--color-success)]"
                    />
                    Diagramas interativos com Mermaid
                  </li>
                  <li className="flex items-center gap-3 font-semibold">
                    <CheckCircle
                      size={20}
                      className="text-[var(--color-success)]"
                    />
                    Quizzes rápidos após cada conceito
                  </li>
                  <li className="flex items-center gap-3 font-semibold">
                    <CheckCircle
                      size={20}
                      className="text-[var(--color-success)]"
                    />
                    Projetos completos em TypeScript
                  </li>
                </ul>
                <Link
                  href="/logica-programacao-typescript/lessons"
                  className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity"
                >
                  Começar agora
                  <ArrowRight size={20} />
                </Link>
              </div>

              {/* Quiz mockup */}
              <div className="bg-[oklch(0.12_0.02_265)] border border-[oklch(0.23_0.015_265)] p-2 rounded-xl shadow-2xl overflow-hidden hidden lg:block">
                <div className="flex flex-col gap-4 p-6 text-[oklch(0.9_0.005_265)]">
                  <div className="space-y-2">
                    <p className="text-[oklch(0.5_0.01_265)] font-mono text-xs uppercase">
                      Exercício 04: Variáveis
                    </p>
                    <div className="bg-black/40 p-4 rounded-lg font-mono text-sm leading-relaxed">
                      <p>
                        <span className="text-[var(--color-primary)]">let</span>{" "}
                        name ={" "}
                        <span className="text-[var(--color-success)]">
                          &quot;Class&quot;
                        </span>
                        ;
                      </p>
                      <p>
                        <span className="text-[var(--color-primary)]">
                          const
                        </span>{" "}
                        year ={" "}
                        <span className="text-[var(--color-warning)]">
                          2024
                        </span>
                        ;
                      </p>
                      <p className="mt-4">
                        <span className="text-[oklch(0.5_0.01_265)]">
                          // Complete o código abaixo:
                        </span>
                      </p>
                      <p>
                        console.log(
                        <span className="bg-[var(--color-primary)]/20 border-b-2 border-[var(--color-primary)] px-4">
                          ?
                        </span>
                        );
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 pt-4">
                    <p className="text-sm font-bold">Qual a saída correta?</p>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="text-left px-4 py-3 rounded-lg border border-[oklch(0.23_0.015_265)] text-sm">
                        A) undefined
                      </div>
                      <div className="text-left px-4 py-3 rounded-lg border border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-sm font-bold">
                        B) Class
                      </div>
                      <div className="text-left px-4 py-3 rounded-lg border border-[oklch(0.23_0.015_265)] text-sm">
                        C) 2024
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="relative bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] rounded-3xl p-12 md:p-20 text-center text-white overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-8">
              <h2 className="text-4xl md:text-5xl font-black">
                Comece sua jornada em tecnologia hoje
              </h2>
              <p className="text-lg opacity-90 leading-relaxed font-medium">
                Junte-se a centenas de alunos que estão transformando suas vidas
                através da programação de qualidade e gratuita.
              </p>
              <Link
                href="/logica-programacao-typescript/lessons"
                className="bg-white text-[var(--color-primary)] px-10 py-5 rounded-xl font-black text-xl hover:shadow-2xl hover:scale-105 transition-all"
              >
                Acessar plataforma
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[var(--color-border)] py-20">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-[var(--color-primary)] p-2 rounded-lg text-white">
                  <Terminal size={20} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Tech{" "}
                  <span className="text-[var(--color-primary)]">Class</span>
                </h2>
              </div>
              <p className="text-[var(--color-muted)] max-w-sm leading-relaxed">
                Desenvolvido com propósito educacional para democratizar o
                acesso ao conhecimento tecnológico de alta qualidade.
              </p>
              <p className="text-sm font-bold text-[var(--color-muted)]">
                Atribuição:{" "}
                <span className="text-[var(--color-foreground)]">CETAM</span>
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Links Rápidos</h4>
              <ul className="space-y-4 text-[var(--color-muted)] font-semibold">
                <li>
                  <Link
                    href="/logica-programacao-typescript/lessons"
                    className="hover:text-[var(--color-primary)] transition-colors"
                  >
                    Aulas
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#cursos"
                    className="hover:text-[var(--color-primary)] transition-colors"
                  >
                    Cursos
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Plataforma</h4>
              <ul className="space-y-4 text-[var(--color-muted)] font-semibold">
                <li>
                  <Link
                    href="/logica-programacao-typescript/lessons/first-program"
                    className="hover:text-[var(--color-primary)] transition-colors"
                  >
                    Primeira aula
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-[var(--color-border)] text-center text-[var(--color-muted)] text-sm font-medium">
            <p>© 2025 academy. Todos os direitos reservados.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
