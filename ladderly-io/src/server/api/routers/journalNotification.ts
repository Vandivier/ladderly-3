import { router, publicProcedure } from '../trpc';
import { db } from '@/server/db';
import { sendJournalEmail } from '@/server/mailers/journalMailer';

export const journalNotificationRouter = router({
  send: publicProcedure.query(async () => {
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
        (freq === 'WEEKLY' && today.getDay() === 1) ||  // Monday
        (freq === 'MONTHLY' && today.getDate() === 1)   // 1st of month
      );

      if (!shouldSend) continue;

      const content = `Hey ${user.name},\n\nHere’s your weekly/monthly career journal reminder!\nLog your thoughts today.`;

      await sendJournalEmail(user, content);
    }

    return { success: true };
  }),
});
