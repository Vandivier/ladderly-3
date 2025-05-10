import { SignupPageWrapper } from '~/app/core/components/page-wrapper/SignupPageWrapper'

export const metadata = {
  title: 'Signup | Research-Backed Learning | Ladderly',
}

const ResearchBackedSignupPage = async () => {
  const pageTitle = 'Signup | Research-Backed Learning | Ladderly'
  const heroHeadline = 'Unlock Your Potential with Research-Backed Learning'
  const valueProps = [
    'Access curated learning paths grounded in research from leading institutions like Harvard.',
    'Benefit from evidence-based strategies to accelerate your career growth.',
    'Join a community committed to high-quality, effective learning methodologies.',
  ]

  return (
    <SignupPageWrapper
      pageTitle={pageTitle}
      heroHeadline={heroHeadline}
      valueProps={valueProps}
    />
  )
}

export default ResearchBackedSignupPage
