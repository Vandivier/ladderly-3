import { PrintfulClient } from "printful-request"

export const printful = new PrintfulClient(process.env.PRINTFUL_APP_SECRET_KEY)
