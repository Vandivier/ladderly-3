import '~/styles/globals.css'
import 'katex/dist/katex.min.css'

import { GeistSans } from 'geist/font/sans'
import { type Metadata } from 'next'
import { ProviderProvider } from './core/components/ProviderProvider'

export const metadata: Metadata = {
  title: 'ladderly.io',
  description:
    'Your tech adventure awaits! Ladderly helps you learn to code, land your first or next programming role, and grow your social and professional networks. Join our passionate community of learners and innovators. Discover tools and programs that accelerate your tech career, embrace open-source learning, and celebrate diversity and quality of life. Start your path to success with Ladderly today.',
  metadataBase: new URL('https://ladderly.io'),
  openGraph: {
    description:
      'Your tech adventure awaits! Ladderly helps you learn to code, land your first or next programming role, and grow your social and professional networks. Join our passionate community of learners and innovators. Discover tools and programs that accelerate your tech career, embrace open-source learning, and celebrate diversity and quality of life. Start your path to success with Ladderly today.',
    type: 'website',
    images: [
      {
        url: '/logo.png',
      },
    ],
  },
  twitter: {
    images: ['/logo.png'],
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
  keywords:
    'Ladderly, learning, innovation, tech career, open source, community, education, programming, career development, diversity, personalized learning, high-performance lifestyle, tech tools, educational programs, coding, fullstack, full stack, full-stack, javascript, typescript, coding, software engineer, web development, react, nextjs, career, job, remote work, mentorship, mentor, tutorial',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <ProviderProvider>{children}</ProviderProvider>
      </body>
    </html>
  )
}
