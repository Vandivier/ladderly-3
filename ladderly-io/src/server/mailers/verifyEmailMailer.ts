import { getPostmarkClient } from '~/server/mailers/utils'

type VerifyEmailMailer = {
  to: string
  token: string
}

export async function sendVerificationEmail({ to, token }: VerifyEmailMailer) {
  const postmarkClient = getPostmarkClient()
  const origin = process.env.APP_ORIGIN ?? 'http://localhost:3000'
  const verifyUrl = `${origin}/verify-email?token=${token}`

  const html = `
    <h1>Verify Your Email Address</h1>
    <p>Please verify your email address by clicking the link below:</p>
    <a href="${verifyUrl}">
      Verify Email Address
    </a>
    <p>If you didn't create an account with Ladderly, you can safely ignore this email.</p>
  `

  const msg = {
    From: 'support@ladderly.io',
    To: to,
    Subject: 'Verify Your Email Address',
    HtmlBody: html,
  }

  try {
    await postmarkClient.sendEmail(msg)
    console.log(`Verification email sent to ${to}`)
  } catch (error) {
    console.error('Failed to send verification email:', error)
    throw new Error('Failed to send verification email')
  }
}
