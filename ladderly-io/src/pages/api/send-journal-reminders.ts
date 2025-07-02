import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '~/server/db'
import { sendJournalReminderEmail } from '~/server/mailers/journalReminderMailer'
import { ReminderFrequency } from '@prisma/client'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  console.log('executing send-journal-reminders')

  const today = new Date()
  const users = await db.user.findMany({
    where: {
      journalReminderFrequency: { not: ReminderFrequency.NONE },
    },
  })

  let sent = 0
  for (const user of users) {
    if (!user.email) continue

    const shouldSend =
      user.journalReminderFrequency === ReminderFrequency.DAILY ||
      (user.journalReminderFrequency === ReminderFrequency.WEEKLY &&
        today.getDay() === 1) ||
      (user.journalReminderFrequency === ReminderFrequency.MONTHLY &&
        today.getDate() === 1)

    if (shouldSend) {
      try {
        await sendJournalReminderEmail({
          to: user.email,
          frequency: user.journalReminderFrequency,
          username: user.name || 'there',
          type: 'journal',
        })
        await db.user.update({
          where: { id: user.id },
          data: { journalReminderLastReminded: new Date() },
        })
        sent++
      } catch (error) {
        console.error(`Failed to send reminder to ${user.email}:`, error)
      }
    }
  }

  res
    .status(200)
    .json({ sent, checked: users.length, date: today.toISOString() })
}
