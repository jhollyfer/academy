// ─── academy ─────────────────────────────────────────────────────────────

export interface IQuizQuestion {
  pergunta: string
  opcoes: string[]
  correta: number
  explicacao: string
  explicacaoErrada: string
}

export interface IProximoPasso {
  titulo: string
  descricao: string
}

export interface ILesson {
  slug: string
  modulo: string
  titulo: string
  subtitulo: string
  descricao: string
  ordem: number
  content: string
  quiz: IQuizQuestion[]
  proximosPassos: IProximoPasso[]
}

export interface ICourseConfig {
  slug: string
  dir: string
  label: string
  language: string
}

export interface IQuizDataQuestion {
  lessonTitulo: string
  lessonDescricao: string
  lessonModulo: string
  pergunta: string
  opcoes: string[]
  correta: number
  explicacao: string
  explicacaoErrada: string
}
