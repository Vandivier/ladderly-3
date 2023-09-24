import { PrintfulClient } from "printful-request"

export const printful = new PrintfulClient(process.env.PRINTFUL_APP_SECRET_KEY)

export const formatVariantName = (variantName: string): string => {
  const [, name] = variantName.split(" - ")

  return name ? name : "One style"
}
