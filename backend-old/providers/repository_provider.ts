import type { ApplicationService } from '@adonisjs/core/types'

export default class RepositoryProvider {
  constructor(protected app: ApplicationService) {}

  register() {}
}
