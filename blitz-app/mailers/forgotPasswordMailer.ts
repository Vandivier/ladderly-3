import { postmarkClient } from 'integrations/postmark'

type ResetPasswordMailer = {
  to: string
  token: string
}

export function forgotPasswordMailer({ to, token }: ResetPasswordMailer) {
  const origin = process.env.APP_ORIGIN || process.env.BLITZ_DEV_SERVER_ORIGIN
  const resetUrl = `${origin}/reset-password?token=${token}`

  const html = `
  <h1>Reset Your Password</h1>
  <a href="${resetUrl}">
    Click here to set a new password
  </a>
`

  const msg = {
    from: 'support@ladderly.io',
    From: 'support@ladderly.io',
    to,
    subject: 'Your Password Reset Instructions',
    Subject: 'Your Password Reset Instructions',
    html,
    HtmlBody: html,
  }

  return {
    async send() {
      if (
        typeof process.env.POSTMARK_API_KEY === 'string' &&
        process.env.POSTMARK_API_KEY !== ''
      ) {
        await postmarkClient.sendEmail(msg)
      } else {
        // Preview email in the browser
        const previewEmail = (await import('preview-email')).default
        await previewEmail(msg)
      }
    },
  }
}
