import { SignupPageWrapper } from '~/app/core/components/page-wrapper/SignupPageWrapper'

export const metadata = {
  title: 'Signup | Technical Job Search Tools for Engineers | Ladderly',
  description:
    'Sign up for Ladderly to access structured LeetCode prep, AI-powered behavioral interview coaching, and data-driven job search tools built for software engineers.',
  keywords: [
    'Ladderly',
    'technical interview prep',
    'software engineering',
    'LeetCode',
    'FAANG',
    'job search tools',
    'resume optimization',
    'behavioral interviews',
    'AI interview prep',
    'coding interviews',
    'job application tracking',
  ],
  openGraph: {
    title: 'Signup | Technical Job Search Tools for Engineers | Ladderly',
    description:
      'Land your next tech job with expert-crafted LeetCode prep, behavioral coaching, and job tracking tools. Sign up to get started with Ladderly.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Signup | Technical Job Search Tools for Engineers | Ladderly',
    description:
      'Ladderly gives software engineers structured LeetCode practice, job search optimization, and behavioral interview prep with AI. Sign up now!',
  },
}

const TechnicalJobSearchSignupPage = async () => {
  const heroHeadline = 'Land Your Next Tech Role with Proven Prep Tools'
  const valueProps = [
    'Sharpen your coding skills with a structured LeetCode roadmap, optimized for real-world hiring patterns.',
    'Practice behavioral interviews with AI-driven prompts based on top-tier tech company questions.',
    'Track your progress and optimize your resume, LinkedIn, and outreach with data-backed workflows.',
  ]

  return (
    <SignupPageWrapper heroHeadline={heroHeadline} valueProps={valueProps} />
  )
}

export default TechnicalJobSearchSignupPage
