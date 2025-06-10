import { PostmarkClient } from 'postmark';
import { env } from '@/server/env';
import { User } from '@prisma/client';

const client = new PostmarkClient(env.POSTMARK_API_KEY);

export async function sendJournalEmail(user: User, journalContent: string) {
  if (user.journalNotificationFrequency === 'NONE') return;

  await client.sendEmail({
    From: 'no-reply@yourdomain.com',
    To: user.email,
    Subject: 'Your Career Journal Update',
    TextBody: journalContent,
    MessageStream: 'outbound',
  });
}
