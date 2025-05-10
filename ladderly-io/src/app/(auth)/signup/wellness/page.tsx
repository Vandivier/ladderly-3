import { SignupPageWrapper } from '~/app/core/components/page-wrapper/SignupPageWrapper'

export const metadata = {
  title: 'Signup | Low-Stress Career Growth & Wellness | Ladderly',
  description:
    'Join Ladderly to grow your career without burning out. Our tools help reduce stress, build confidence, and support your personal and professional goals.',
  keywords: [
    'Ladderly',
    'mental health',
    'low stress',
    'career growth',
    'wellness',
    'journaling',
    'career tools',
    'work-life balance',
    'confidence building',
    'emotional well-being',
  ],
  openGraph: {
    title: 'Signup | Low-Stress Career Growth & Wellness | Ladderly',
    description:
      'Advance your career while maintaining your mental health. Join Ladderly to reduce stress, stay organized, and feel supported in your growth.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Signup | Low-Stress Career Growth & Wellness | Ladderly',
    description:
      'Ladderly helps you build a meaningful career while staying grounded. Track your wins, reduce burnout, and grow with clarity. Sign up now!',
  },
}

const WellnessSignupPage = async () => {
  const heroHeadline = 'Advance Your Career Without Burning Out'
  const valueProps = [
    'Use guided journaling to offload stress, reflect on wins, and boost emotional clarity.',
    'Access structured plans that keep you focused without feeling overwhelmed.',
    'Join a supportive community and use tools that help you enjoy the journey — not just chase the next job.',
  ]

  return (
    <SignupPageWrapper heroHeadline={heroHeadline} valueProps={valueProps} />
  )
}

export default WellnessSignupPage
