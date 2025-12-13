import type { UserWithSubscriptions } from '~/server/schemas'
import { ReminderFrequency, RoleEnum } from '@prisma/client'

export function makeMockUser(
  overrides: Partial<UserWithSubscriptions> = {},
): Partial<UserWithSubscriptions> {
  return {
    id: 1,
    uuid: 'test-uuid',
    email: 'test@test.com',
    name: 'Test User',
    nameFirst: 'Test',
    nameLast: 'User',
    role: RoleEnum.USER,

    createdAt: new Date(),
    updatedAt: new Date(),

    image: null,
    adminNotes: '',
    emailBackup: '',
    emailStripe: '',

    emailVerified: false,
    emailVerifiedDate: null,

    hasDeepJournalingInterest: false,
    journalReminderFrequency: ReminderFrequency.NONE,
    journalReminderLastReminded: null,

    subscriptions: [],

    ...overrides,
  }
}
