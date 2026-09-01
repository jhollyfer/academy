import Enrollment from '#models/enrollment'
import EnrollmentFile from '#models/enrollment_file'
import Storage from '#models/storage'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import {
  EnrollmentFileKinds,
  EnrollmentStatuses,
  UploadStatuses,
  type Merge,
} from '#core/entity'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import type { ProtocolPayload, StorefrontEnrollmentAttachmentPayload } from '#core/validator'

type Payload = Merge<StorefrontEnrollmentAttachmentPayload, ProtocolPayload>
type Response = Either<HTTPException, Enrollment>

@inject()
export default class StorefrontEnrollmentAttachUseCase {
  async execute({ protocol, storageId, kind }: Payload): Promise<Response> {
    try {
      const enrollment = await Enrollment.query()
        .where('protocol', protocol)
        .whereNull('deletedAt')
        .first()

      if (!enrollment)
        return left(HTTPException.NotFound('Matrícula não encontrada', 'ENROLLMENT_NOT_FOUND'))

      // Matrícula cancelada não recebe anexo: mandar comprovante para um pedido
      // encerrado daria ao candidato a impressão de que ele voltou a andar.
      if (enrollment.status === EnrollmentStatuses.CANCELLED)
        return left(
          HTTPException.Conflict('Matrícula cancelada', 'ENROLLMENT_CANCELLED', {
            protocol: 'Esta matrícula foi cancelada e não aceita anexos',
          })
        )

      const storage = await Storage.query()
        .where('id', storageId)
        .whereNull('deletedAt')
        .first()

      if (!storage)
        return left(
          HTTPException.UnprocessableEntity('Arquivo não encontrado', 'STORAGE_NOT_FOUND', {
            storageId: 'Envie o arquivo antes de anexá-lo',
          })
        )

      // Só `UPLOADED` é anexável. Entre `POST /storages` e o `complete`, a linha
      // existe sem binário íntegro - anexar aí deixaria a secretaria conferindo
      // um comprovante pela metade.
      if (storage.status !== UploadStatuses.UPLOADED)
        return left(
          HTTPException.UnprocessableEntity('Upload não concluído', 'STORAGE_NOT_UPLOADED', {
            storageId: 'Aguarde o envio do arquivo terminar',
          })
        )

      await EnrollmentFile.create({
        enrollmentId: enrollment.id,
        storageId: storage.id,
        kind: kind ?? EnrollmentFileKinds.PAYMENT_RECEIPT,
      })

      await enrollment.load('files', function (files) {
        files.preload('storage')
      })

      // Anexar **não** confirma a matrícula: quem confirma é a secretaria, no
      // painel, depois de olhar o comprovante. Carimbar `CONFIRMED` aqui
      // entregaria a vaga a quem anexasse qualquer imagem.
      return right(enrollment)
    } catch (error) {
      logger.error({ err: error }, '[storefront > enrollments > attach][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'ENROLLMENT_ATTACH_ERROR')
      )
    }
  }
}
