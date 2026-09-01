import type { ApplicationService } from '@adonisjs/core/types'
import { Server } from 'socket.io'
import { handleConnection } from '#services/quiz/quiz_room_manager'

export default class WsProvider {
  constructor(protected app: ApplicationService) {}

  async ready() {
    if (this.app.getEnvironment() === 'web') {
      const server = await this.app.container.make('server')
      const httpServer = server.getNodeServer()

      const corsOrigin = process.env.CORS_ORIGIN || '*'
      const io = new Server(httpServer, {
        cors: { origin: corsOrigin },
      })

      io.on('connection', (socket) => {
        handleConnection(socket)
      })
    }
  }
}
