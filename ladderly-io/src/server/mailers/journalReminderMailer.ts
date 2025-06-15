import { ServerClient } from 'postmark'

const client = new ServerClient(process.env.POSTMARK_API_KEY!)

export async function sendJournalReminderEmail({
  to,
  frequency,
  username,
}: {
  to: string
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  username: string
}) {
  const subject = `Your ${frequency.toLowerCase()} journal reminder`
  const body = `
Hi ${username},

This is your ${frequency.toLowerCase()} reminder to write in your journal!

Stay consistent and keep growing.

– The Ladderly Team
`
  try {
    await client.sendEmail({
      From: process.env.POSTMARK_FROM_EMAIL!,
      To: to,
      Subject: subject,
      TextBody: body,
    })
    console.log(`Journal reminder email sent to ${to}`)
  } catch (error) {
    console.error('Failed to send journal reminder email:', error)
  }
}