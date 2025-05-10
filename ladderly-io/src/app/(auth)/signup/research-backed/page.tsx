import { SignupPageWrapper } from '~/app/core/components/page-wrapper/SignupPageWrapper'

export const metadata = {
  title: 'Signup | Journaling with The Progress Principle | Ladderly',
  description:
    'Sign up for Ladderly and leverage our journaling tool, inspired by Harvard\'s "The Progress Principle", to enhance motivation and track small wins for career growth.',
  keywords: [
    'Ladderly',
    'signup',
    'career',
    'journaling',
    'motivation',
    'The Progress Principle',
    'Harvard',
    'goal setting',
    'productivity',
  ],
  openGraph: {
    title: 'Signup | Journaling with The Progress Principle | Ladderly',
    description:
      "Boost your career progress with Ladderly's journaling tool, backed by Harvard Business School research. Sign up to get started!",
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Signup | Journaling with The Progress Principle | Ladderly',
    description:
      'Track your wins and stay motivated with Ladderly\'s journaling tool, inspired by Harvard\'s "The Progress Principle". Sign up now!',
  },
}

const ResearchBackedSignupPage = async () => {
  const heroHeadline = 'Unlock Your Potential with Research-Backed Learning'
  const valueProps = [
    'Build daily momentum with a journaling method grounded in Harvard research on motivation and performance',
    'Track your "small wins" to boost motivation, engagement, and performance consistently.',
    'Foster a positive inner work life and make tangible progress towards your career goals.',
  ]

  return (
    <SignupPageWrapper heroHeadline={heroHeadline} valueProps={valueProps} />
  )
}

export default ResearchBackedSignupPage
