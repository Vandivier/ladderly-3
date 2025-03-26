'use server'

import Link from 'next/link'

export const ReimbursmentLetterLink = () => (
  <Link
    className="text-m font-bold text-ladderly-pink hover:underline"
    href="https://docs.google.com/document/d/1DtwRvBRimmSiuQ-jkKo_P9QNBPLKQkFemR9vT_Kl9Jg"
    id="reimbursment-letter-link"
    target="_blank"
  >
    Reimbursement Request Letter
  </Link>
)
