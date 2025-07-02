import { ReminderFrequency } from '@prisma/client'
import { ServerClient } from 'postmark'

const client = new ServerClient(process.env.POSTMARK_API_KEY!)

export async function sendJournalReminderEmail({
  to,
  frequency,
  username,
  type = 'journal',
}: {
  to: string
  frequency: ReminderFrequency
  username: string
  type?: 'journal' | 'career'
}) {
  const subject = `Your ${frequency.toLowerCase()} ${type} reminder`
  const textBody = `
Hi ${username},

This is your ${frequency.toLowerCase()} reminder to write in your ${type}!

Stay consistent and keep growing.

– The Ladderly Team
`
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #222;">
      <h2>Hi ${username},</h2>
      <p>This is your <strong>${frequency.toLowerCase()}</strong> reminder to write in your <strong>${type}</strong>!</p>
      <p>Stay consistent and keep growing.</p>
      <p style="margin-top:2em;">– The Ladderly Team</p>
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
