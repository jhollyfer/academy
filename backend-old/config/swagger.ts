import path from 'node:path'
import url from 'node:url'

export default {
  path: path.dirname(url.fileURLToPath(import.meta.url)) + '/../',
  tagIndex: 2,
  snakeCase: true,
  debug: false,
  ignore: ['/swagger', '/docs', '/'],
  preferredPutPatch: 'PUT',
  common: {
    parameters: {},
    headers: {},
  },
  securitySchemes: {
    BearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },
  authMiddlewares: ['auth'],
  defaultSecurityScheme: 'BearerAuth',
  persistAuthorization: true,
  showFullPath: false,
  info: {
    title: 'academy API',
    version: '0.0.1',
    description: 'API da plataforma academy — cursos, aulas e quizzes interativos.',
  },
}
