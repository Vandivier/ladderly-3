import { JobBoardContactType, type Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '~/server/api/trpc'
import {
  JOB_POST_ELIGIBILITY_MESSAGE,
  canPostJobs,
  getJobPostExpiryDate,
} from './helpers'
import {
  GetJobBoardPostsSchema,
  JobBoardPostCreateSchema,
  JobBoardPostUpdateSchema,
} from './schemas'

const AUTHOR_SELECT = {
  id: true,
  nameFirst: true,
  nameLast: true,
  profilePicture: true,
} satisfies Prisma.UserSelect

const requireOwnedPost = async (
  db: Prisma.TransactionClient,
  postId: number,
  userId: number,
) => {
  const post = await db.jobBoardPost.findUnique({ where: { id: postId } })

  if (!post) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Job post not found',
    })
  }

  if (post.authorId !== userId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not have permission to modify this job post',
    })
  }

  return post
}

export const jobBoardRouter = createTRPCRouter({
  getPosts: publicProcedure
    .input(GetJobBoardPostsSchema)
    .query(async ({ ctx, input }) => {
      const where: Prisma.JobBoardPostWhereInput = {
        expiresAt: { gt: new Date() },
      }

      if (input.searchTerm) {
        where.OR = [
          { companyName: { contains: input.searchTerm, mode: 'insensitive' } },
          { jobTitle: { contains: input.searchTerm, mode: 'insensitive' } },
        ]
      }

      if (input.contactType) {
        where.contactType = input.contactType
      }

      if (input.introJobFamily) {
        where.introJobFamilies = { has: input.introJobFamily }
      }

      if (typeof input.minSalary === 'number') {
        // match posts whose top-of-range clears the requested minimum
        where.AND = [
          {
            OR: [
              { baseSalaryMax: { gte: input.minSalary } },
              { baseSalaryMax: null, baseSalaryMin: { gte: input.minSalary } },
            ],
          },
        ]
      }

      const orderBy: Prisma.JobBoardPostOrderByWithRelationInput[] =
        input.sortBy === 'salaryDesc'
          ? [
              { baseSalaryMax: { sort: 'desc', nulls: 'last' } },
              { baseSalaryMin: { sort: 'desc', nulls: 'last' } },
              { createdAt: 'desc' },
            ]
          : [{ createdAt: 'desc' }]

      const posts = await ctx.db.jobBoardPost.findMany({
        where,
        orderBy,
        skip: input.skip,
        take: input.take + 1,
        include: { author: { select: AUTHOR_SELECT } },
      })

      const hasMore = posts.length > input.take

      return {
        posts: hasMore ? posts.slice(0, input.take) : posts,
        hasMore,
      }
    }),

  getPost: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.jobBoardPost.findUnique({
        where: { id: input.id },
        include: { author: { select: AUTHOR_SELECT } },
      })

      const sessionUserId = ctx.session?.user?.id
        ? parseInt(ctx.session.user.id)
        : null
      const isExpired = post !== null && post.expiresAt <= new Date()

      // expired posts remain visible to their author only
      if (!post || (isExpired && post.authorId !== sessionUserId)) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Job post not found',
        })
      }

      return post
    }),

  getMyPosts: protectedProcedure.query(async ({ ctx }) => {
    const userId = parseInt(ctx.session.user.id)

    return ctx.db.jobBoardPost.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
    })
  }),

  create: protectedProcedure
    .input(JobBoardPostCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id)

      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: {
          hasPublicProfileEnabled: true,
          profileLinkedInUri: true,
          profileContactEmail: true,
        },
      })

      if (!user || !canPostJobs(user)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: JOB_POST_ELIGIBILITY_MESSAGE,
        })
      }

      return ctx.db.jobBoardPost.create({
        data: {
          companyName: input.companyName,
          jobTitle: input.jobTitle,
          description: input.description ?? null,
          jobPostUrl: input.jobPostUrl?.trim() ?? null,
          location: input.location,
          isRemote: input.isRemote,
          baseSalaryMin: input.baseSalaryMin ?? null,
          baseSalaryMax: input.baseSalaryMax ?? null,
          contactType: input.contactType,
          introJobFamilies:
            input.contactType === JobBoardContactType.POSTER
              ? []
              : input.introJobFamilies,
          expiresAt: getJobPostExpiryDate(),
          authorId: userId,
        },
      })
    }),

  update: protectedProcedure
    .input(JobBoardPostUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id)
      const { id, ...updateData } = input

      const post = await requireOwnedPost(ctx.db, id, userId)

      const contactType = updateData.contactType ?? post.contactType

      return ctx.db.jobBoardPost.update({
        where: { id },
        data: {
          ...updateData,
          contactType,
          introJobFamilies:
            contactType === JobBoardContactType.POSTER
              ? []
              : (updateData.introJobFamilies ?? post.introJobFamilies),
        },
      })
    }),

  renew: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id)

      await requireOwnedPost(ctx.db, input.id, userId)

      return ctx.db.jobBoardPost.update({
        where: { id: input.id },
        data: { expiresAt: getJobPostExpiryDate() },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id)

      await requireOwnedPost(ctx.db, input.id, userId)

      await ctx.db.jobBoardPost.delete({ where: { id: input.id } })

      return { success: true }
    }),
})
