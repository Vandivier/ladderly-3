import { createCallerFactory, createTRPCRouter } from '~/server/api/trpc'
import { userRouter } from './routers/user'
import { authRouter } from './routers/auth'
import { checklistRouter } from './routers/checklist'
import { chatRouter } from './routers/chat'
import { jobSearchRouter } from './routers/jobSearch/router'
import { courseRouter } from './routers/course'
import { quizRouter } from './routers/quiz'
import { certificateRouter } from './routers/certificate'
import { journalRouter } from './routers/journal'
import { journalNotificationRouter } from './routers/journalNotification'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  auth: authRouter,
  checklist: checklistRouter,
  chat: chatRouter,
  jobSearch: jobSearchRouter,
  course: courseRouter,
  quiz: quizRouter,
  certificate: certificateRouter,
  journal: journalRouter,
  journalNotifications: journalNotificationRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter)
