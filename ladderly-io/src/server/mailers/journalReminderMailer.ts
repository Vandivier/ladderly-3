import type { ReminderFrequency } from '@prisma/client'
import { ServerClient } from 'postmark'

const client = new ServerClient(process.env.POSTMARK_API_KEY!)

export async function sendJournalReminderEmail({
  to,
  frequency,
  username = 'there',
}: {
  to: string
  frequency: ReminderFrequency
  username?: string
}) {
  const subject = `Ladderly.io Journal Reminder!`
  const textBody = `
Hi ${username}!

This is your ${frequency.toLowerCase()} reminder to write in your career journal!

Stay consistent and keep growing.

- The Ladderly Team
https://www.ladderly.io/
`
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #222;">
      <h2>Hi ${username}!</h2>
      <p>This is your <strong>${frequency.toLowerCase()}</strong> reminder to write in your career journal!</p>
      <p>Stay consistent and keep growing.</p>
      <p style="margin-top:2em;">– The Ladderly Team</p>
      <p><a href="https://www.ladderly.io/">https://www.ladderly.io/</a></p>
    </div>
  `
  try {
    await client.sendEmail({
      From: process.env.POSTMARK_FROM_EMAIL!,
      To: to,
      Subject: subject,
      TextBody: textBody,
      HtmlBody: htmlBody,
    })
    console.log(`Journal reminder email sent to ${to}`)
  } catch (error) {
    console.error('Failed to send journal reminder email:', error)
  }
}
