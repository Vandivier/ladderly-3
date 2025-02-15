import { type NextApiRequest } from 'next'
import { type NextApiResponse } from 'next'
import { appRouter } from '~/server/api/root'
import { createTRPCContext } from '~/server/api/trpc'
import { applyWSSHandler } from '@trpc/server/adapters/ws'
import { WebSocketServer } from 'ws'

export const runtime = 'nodejs'

function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!res.socket) {
    res.status(500).send('No socket connection available')
    return
  }

  const wss = new WebSocketServer({ noServer: true })

  applyWSSHandler({
    wss,
    router: appRouter,
    createContext: createTRPCContext,
  })

  res.socket.server.wss = wss

  res.status(200).json({ message: 'WebSocket server is running' })
}

export { handler as GET, handler as POST }
