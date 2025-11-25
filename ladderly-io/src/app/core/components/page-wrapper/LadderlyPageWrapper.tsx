import Link from 'next/link'
import React from 'react'
import { PaymentTierEnum } from '@prisma/client'
import { auth, type LadderlyServerSession } from '~/server/better-auth'
import { headers } from 'next/headers'

import { LadderlyAnalytics } from '../LadderlyAnalytics'
import { TopNav } from './TopNav'

import styles from 'src/styles/Home.module.css'
import { LadderlyPitch } from '../LadderlyPitch'

interface LadderlyPageWrapperProps {
  children: React.ReactNode
  authenticate?: boolean
  requirePremium?: boolean
  unauthenticatedView?: React.ReactNode
  previewView?: React.ReactNode
}

export async function LadderlyPageWrapper({
  children,
  authenticate = false,
  requirePremium = false,
  unauthenticatedView,
  previewView,
}: LadderlyPageWrapperProps) {
  let content = children

  if (authenticate) {
    const session = await auth.api.getSession({
      headers: headers(),
    }) as LadderlyServerSession
    const user = session?.user

    if (!session) {
      content = unauthenticatedView ?? <LadderlyPitch />
    } else if (
      requirePremium &&
      user?.subscription?.tier === PaymentTierEnum.FREE
    ) {
      content = previewView ?? (
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <p className="text-center text-gray-800 dark:text-gray-200">
            A premium subscription is required to access this content.
          </p>
          <p className="text-center text-gray-800 dark:text-gray-200">
            Please{' '}
            <a
              href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? '#'}
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              upgrade to premium
            </a>{' '}
            - only $6/month!
          </p>
        </div>
      )
    }
  }

  return (
    <div className={styles.container}>
      <LadderlyAnalytics />
      <TopNav />

      <div className={styles.globe} />

      {content}

      <footer className={styles.footer}>
        <ul className={styles['footer-links']}>
          <li>
            <Link href="/about" className="text-link-fancy">
              About
            </Link>
          </li>
          <li>
            <Link
              href="https://discord.gg/fAg6Xa4uxc"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link-fancy"
            >
              Discord
            </Link>
          </li>
          <li>
            <Link
              href="https://github.com/Vandivier/ladderly-3"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link-fancy"
            >
              GitHub
            </Link>
          </li>
          <li>
            <Link href="/privacy-policy" className="text-link-fancy">
              Privacy Policy
            </Link>
          </li>
        </ul>
        <p>
          Copyright © {new Date().getFullYear()}{' '}
          <Link
            href="https://vandivier.github.io/not-johns-linktree/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-link-fancy"
          >
            John Vandivier
          </Link>
        </p>
      </footer>
    </div>
  )
}
