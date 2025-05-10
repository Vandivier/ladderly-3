import { SignupPageWrapper } from '~/app/core/components/page-wrapper/SignupPageWrapper'

export const metadata = {
  title: 'Signup | Strategic Interview Prep for Tech Roles | Ladderly',
  description:
    'Sign up for Ladderly and prepare for behavioral interviews with our research-backed STOARR framework. Build confidence, master storytelling, and boost your job search success.',
  keywords: [
    'Ladderly',
    'interview prep',
    'job search',
    'behavioral interviews',
    'resume optimization',
    'career stories',
    'STAR method',
    'SOAR method',
    'STOARR',
    'FAANG interviews',
    'job readiness',
  ],
  openGraph: {
    title: 'Signup | Strategic Interview Prep for Tech Roles | Ladderly',
    description:
      "Get ready for interviews in engineering, product, data, and design with Ladderly's expert tools and frameworks. Sign up now to build your story bank and ace your next round.",
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Signup | Strategic Interview Prep for Tech Roles | Ladderly',
    description:
      'Sign up for Ladderly to master behavioral interviews using the advanced STOARR method. Practice with AI, prep your resume, and increase your interview success.',
  },
}

const StrategicPrepSignupPage = async () => {
  const heroHeadline =
    'Master Interviews with Story-Driven, Research-Backed Prep'
  const valueProps = [
    "Craft confident, persuasive behavioral stories using Ladderly.io's advanced framework — go beyond the STAR method.",
    'Prep smarter with resume A/B testing and job search tracking tools to improve your application-to-interview ratio.',
    'Practice interviews with AI and industry-informed frameworks used by interviewers at companies like Amazon and Meta.',
  ]

  return (
    <SignupPageWrapper heroHeadline={heroHeadline} valueProps={valueProps} />
  )
}

export default StrategicPrepSignupPage
