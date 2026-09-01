import type { AdministratorCourseCreatePayload } from '#/lib/validator'
import type { CourseResponse } from '#/integrations/response'

/**
 * Os campos que o backend pode acusar num 422 ou num 409.
 *
 * Escrito uma vez e usado nos dois formulários: uma lista por tela divergiria, e
 * o campo de fora vira erro que aparece no rodapé em vez de no input.
 */
export const COURSE_FIELDS = [
  'name',
  'slug',
  'tagline',
  'description',
  'accent',
  'workloadHours',
  'durationMonths',
  'minimumAge',
  'requirements',
  'projectOutcome',
  'enrollmentFeeInCents',
  'monthlyFeeInCents',
  'coverId',
  'position',
  'status',
] as const

/** O formulário vazio. */
export function courseDefaults(): AdministratorCourseCreatePayload {
  return {
    name: '',
    slug: undefined,
    tagline: null,
    description: '',
    accent: 'ROBOTICS',
    workloadHours: 32,
    durationMonths: 4,
    minimumAge: null,
    requirements: null,
    projectOutcome: null,
    enrollmentFeeInCents: 15000,
    monthlyFeeInCents: 15000,
    coverId: null,
    position: 0,
    status: 'ACTIVE',
    modules: [],
    faqs: [],
  }
}

/**
 * O registro carregado, na forma que o formulário segura.
 *
 * A conversão existe porque a resposta traz mais do que o formulário edita -
 * `id`, `createdAt`, a contagem de turmas - e porque a grade e o FAQ chegam com
 * `id` e `position`, que o payload de escrita não aceita: a ordem é o índice do
 * array, e mandar `position` de volta seria o cliente decidindo o que o servidor
 * já decide.
 */
export function courseToValues(course: CourseResponse): AdministratorCourseCreatePayload {
  return {
    name: course.name,
    slug: course.slug,
    tagline: course.tagline,
    description: course.description,
    accent: course.accent,
    workloadHours: course.workloadHours,
    durationMonths: course.durationMonths,
    minimumAge: course.minimumAge,
    requirements: course.requirements,
    projectOutcome: course.projectOutcome,
    enrollmentFeeInCents: course.enrollmentFeeInCents,
    monthlyFeeInCents: course.monthlyFeeInCents,
    coverId: course.coverId,
    position: course.position,
    status: course.status,
    modules: (course.modules ?? []).map((entry) => ({
      title: entry.title,
      description: entry.description,
    })),
    faqs: (course.faqs ?? []).map((entry) => ({
      question: entry.question,
      answer: entry.answer,
    })),
  }
}
