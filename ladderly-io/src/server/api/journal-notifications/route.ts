import { db } from '@/server/db';
import { sendJournalEmail } from '@/server/mailers/journalMailer';
import { NextResponse } from 'next/server';

export async function GET() {
  const today = new Date();

  const users = await db.user.findMany({
    where: {
      journalNotificationFrequency: {
        not: 'NONE',
      },
    },
  });

  for (const user of users) {
    const freq = user.journalNotificationFrequency;

    const shouldSend = (
      (freq === 'DAILY') ||
      (freq === 'WEEKLY' && today.getDay() === 1) ||
      (freq === 'MONTHLY' && today.getDate() === 1)
    );

    if (!shouldSend) continue;

    const content = `Hey ${user.name},\n\nHere’s your journal reminder!\nVisit the site and log your progress.`;

    await sendJournalEmail(user, content);
  }

  return NextResponse.json({ ok: true });
}
