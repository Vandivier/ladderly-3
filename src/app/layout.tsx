import { Metadata } from 'next'
import { Inter } from 'next/font/google'

import BlitzClientWrapper from 'src/core/components/page-wrapper/BlitzClientWrapper'
import './styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

const META_DESCRIPTION =
  'Ladderly is a coding bootcamp alternative and career accelerator.' +
  ' Land your next programming role in as little as three months!'
const META_TITLE = 'Ladderly.io | Land your next programming role!'

export const metadata: Metadata = {
  metadataBase: new URL('https://ladderly.io'),
  title: {
    default: META_TITLE,
    template: 'Ladderly.io | %s',
  },
  description: META_DESCRIPTION,
  keywords:
    'Ladderly, Ladderly.io, learning, innovation, tech career, open source, community, education, programming, career development, diversity, personalized learning, high-performance lifestyle, tech tools, educational programs, coding, fullstack, full stack, full-stack, javascript, typescript, coding, software engineer, web development, react, nextjs, career, job, remote work, mentorship, mentor, tutorial',
  openGraph: {
    title: META_TITLE,
    description: META_DESCRIPTION,
    url: 'https://ladderly.io/',
    siteName: 'ladderly.io',
    images: [
      {
        url: 'https://www.ladderly.io/logo.png',
        width: 270,
        height: 270,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: META_TITLE,
    description: META_DESCRIPTION,
    images: ['https://www.ladderly.io/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: '/',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BlitzClientWrapper>{children}</BlitzClientWrapper>
      </body>
    </html>
  )
}
