import Link from 'next/link'
import React from 'react'

import Layout, { LayoutProps } from '../../layouts/Layout'
import { TopNav } from './TopNav'

import styles from 'src/app/styles/Home.module.css'

export const LadderlyPageWrapper: React.FC<LayoutProps> = ({
  children,
  slug = '',
  title,
}) => (
  <Layout slug={slug} title={title}>
    <div className={styles.container}>
      <TopNav />

      <div className={styles.globe} />

      {children}

      <footer className={styles.footer}>
        <ul className={styles['footer-links']}>
          <Link className={styles.textLink} href={'/about'}>
            About
          </Link>
          <a
            href="https://discord.gg/fAg6Xa4uxc"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.textLink}
          >
            Discord
          </a>
          <a
            href="https://github.com/Vandivier/ladderly-3#about"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.textLink}
          >
            GitHub
          </a>
          <Link className={styles.textLink} href={'/privacy-policy'}>
            Privacy Policy
          </Link>
        </ul>
        <p>
          Copyright © 2023
          <a
            href="https://vandivier.github.io/not-johns-linktree/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.textLink}
          >
            John Vandivier
          </a>
        </p>
      </footer>
    </div>
  </Layout>
)
