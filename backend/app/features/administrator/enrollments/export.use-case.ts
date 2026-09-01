import Enrollment from '#models/enrollment'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import { SortDirections, TrashedModes, sortOrder } from '#core/entity'
import type { AdministratorEnrollmentPaginationPayload } from '#core/validator'

type Payload = AdministratorEnrollmentPaginationPayload
type Response = Either<HTTPException, string>

/**
 * `;` e não `,`: o Excel em português usa a vírgula como separador decimal, e um
 * CSV separado por vírgula abre numa coluna só.
 */
const SEPARATOR = ';'

/**
 * Marca de ordem de bytes. Sem ela o Excel lê o arquivo como Latin-1 e todo
 * acento vira caractere trocado - "Matrícula" sai "MatrÃ­cula".
 */
const BOM = '﻿'

const COLUMNS = [
  'Protocolo',
  'Situação',
  'Aluno',
  'Nascimento',
  'CPF',
  'E-mail',
  'Telefone',
  'Responsável',
  'CPF do responsável',
  'Telefone do responsável',
  'Curso',
  'Turma',
  'Enviada em',
] as const

/**
 * Escapa um campo pela regra do RFC 4180, adaptada ao separador `;`.
 *
 * Sem isto, um nome com `;` ou uma anotação com quebra de linha desloca todas as
 * colunas seguintes - e o arquivo abre torto sem nenhum erro visível.
 */
function escape(value: unknown): string {
  if (value === null || value === undefined) return ''

  const text = String(value)

  if (!text.includes(SEPARATOR) && !text.includes('"') && !text.includes('\n')) return text

  return `"${text.replaceAll('"', '""')}"`
}

@inject()
export default class EnrollmentExportUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const query = Enrollment.query().preload('class', function (turma) {
        turma.preload('course')
      })

      if (!payload.trashed) query.whereNull('deletedAt')
      if (payload.trashed === TrashedModes.ONLY) query.whereNotNull('deletedAt')

      if (payload.classId) query.where('classId', payload.classId)
      if (payload.status) query.where('status', payload.status)

      if (payload.courseId)
        query.whereIn(
          'classId',
          Enrollment.query().client.from('classes').select('id').where('course_id', payload.courseId)
        )

      if (payload.search) {
        const term = `%${payload.search}%`

        query.where(function (scope) {
          scope
            .whereILike('studentName', term)
            .orWhereILike('email', term)
            .orWhereILike('protocol', term)
        })
      }

      // Sem paginação: `?page` e `?perPage` chegam no payload e são ignorados de
      // propósito. Exportar meia lista é pior que não exportar - ninguém confere
      // a contagem de um arquivo que abriu.
      const enrollments = await query.orderBy(
        ...sortOrder(
          { ...payload, direction: payload.direction ?? SortDirections.DESC },
          'createdAt'
        )
      )

      const rows = enrollments.map(function (enrollment) {
        return [
          enrollment.protocol,
          enrollment.status,
          enrollment.studentName,
          enrollment.studentBirthDate.toFormat('dd/MM/yyyy'),
          enrollment.studentDocument,
          enrollment.email,
          enrollment.phone,
          enrollment.guardianName,
          enrollment.guardianDocument,
          enrollment.guardianPhone,
          enrollment.class?.course?.name,
          enrollment.class?.name,
          enrollment.createdAt.toFormat('dd/MM/yyyy HH:mm'),
        ]
          .map(escape)
          .join(SEPARATOR)
      })

      // `\r\n` porque é o que o RFC 4180 pede e o que o Excel espera.
      return right(BOM + [COLUMNS.join(SEPARATOR), ...rows].join('\r\n'))
    } catch (error) {
      logger.error({ err: error }, '[enrollments > export][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'ENROLLMENT_EXPORT_ERROR')
      )
    }
  }
}
