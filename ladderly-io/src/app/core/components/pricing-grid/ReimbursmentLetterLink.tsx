'use client'

import Link from 'next/link'
import { event } from 'nextjs-google-analytics'

export const ReimbursmentLetterLink = () => (
  <Link
    className="text-m font-bold text-ladderly-pink hover:underline"
    href="https://docs.google.com/document/d/1DtwRvBRimmSiuQ-jkKo_P9QNBPLKQkFemR9vT_Kl9Jg"
    onClick={() => {
      event('click', {
        category: 'Link',
        label: 'Reimbursment Request Letter Link Click',
      })
    }}
    target="_blank"
  >
    Reimbursement Request Letter
  </Link>
)
