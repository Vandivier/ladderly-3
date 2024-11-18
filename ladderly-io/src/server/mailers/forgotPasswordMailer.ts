import { ServerClient } from 'postmark';

const postmarkClient = new ServerClient(
  process.env.POSTMARK_API_KEY || ''
);

type ResetPasswordMailer = {
  to: string;
  token: string;
};

export async function sendForgotPasswordEmail({ to, token }: ResetPasswordMailer) {
  const origin = process.env.APP_ORIGIN || 'http://localhost:3000'; // Default to localhost if APP_ORIGIN is not set
  const resetUrl = `${origin}/reset-password?token=${token}`;

  const html = `
    <h1>Reset Your Password</h1>
    <a href="${resetUrl}">
      Click here to set a new password
    </a>
  `;

  const msg = {
    From: 'support@ladderly.io',
    To: to,
    Subject: 'Your Password Reset Instructions',
    HtmlBody: html,
  };

  try {
    await postmarkClient.sendEmail(msg);
    console.log(`Password reset email sent to ${to}`);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
} 