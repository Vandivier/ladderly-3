import { ServerClient } from 'postmark'

export const getPostmarkClient = () => {
  if (!process.env.POSTMARK_API_KEY) {
    console.error(
      'POSTMARK_API_KEY is not set. Unable to send forgot password email.',
    )
    throw new Error('Mail service is not configured on this server.')
  }

  return new ServerClient(process.env.POSTMARK_API_KEY)
}
