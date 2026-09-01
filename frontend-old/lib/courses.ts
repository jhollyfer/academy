export interface CourseConfig {
  dir: string;
  label: string;
  language: string;
}

export const courses: Record<string, CourseConfig> = {
  "logica-programacao-typescript": {
    dir: "logica-programacao-typescript",
    label: "Lógica de Programação",
    language: "TypeScript",
  },
  "logica-programacao-python": {
    dir: "logica-programacao-python",
    label: "Lógica de Programação",
    language: "Python",
  },
  "informatica-avancada-word": {
    dir: "informatica-avancada-word",
    label: "Informática Avançada",
    language: "Word",
  },
  "empreendedorismo": {
    dir: "empreendedorismo",
    label: "Empreendedorismo",
    language: "Saúde",
  },
  "banco-de-dados": {
    dir: "banco-de-dados",
    label: "Banco de Dados",
    language: "SQL",
  },
};

export function getCourseConfig(course: string): CourseConfig | undefined {
  return courses[course];
}

export function getAllCourseKeys(): string[] {
  return Object.keys(courses);
}
