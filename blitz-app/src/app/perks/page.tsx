import { LadderlyPageWrapper } from 'src/core/components/page-wrapper/LadderlyPageWrapper'

import styles from 'src/app/styles/Home.module.css'

interface Perk {
  title: string
  description: string
  discount: string
  link: string
  linkText: string
}

const perks: Perk[] = [
  {
    title: 'Neetcode',
    description:
      'A better way to prepare for coding interviews. In-depth explanations of data structure and algorithm problems by an ex-Google engineer and popular YouTuber.',
    discount: '10% off',
    link: 'https://neetcode.io',
    linkText: 'Redeem your 10% discount',
  },
  {
    title: 'CodeCrafters',
    description:
      'Advanced-level software engineering exercises (e.g., Build your own Redis, Git, Docker, etc.) in Python, Rust, Go, etc.',
    discount: '40% off',
    link: 'https://codecrafters.io',
    linkText: 'Redeem your 40% discount',
  },
  {
    title: 'Interviewing.io',
    description:
      'Anonymous mock interviews with Senior/Staff/Principal engineers from FAANG. Get feedback from the same people who make hiring decisions at top companies.',
    discount: '$50 off',
    link: 'https://interviewing.io',
    linkText: 'Redeem your $50 discount',
  },
  // Add more perks as needed
]

const PerkCard = ({ title, description, discount, link, linkText }: Perk) => {
  return (
    <div className="mb-6 rounded-lg border bg-white p-4 shadow-md">
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="mb-3 text-sm text-gray-700">{description}</p>
      <p className="mb-3 font-bold text-purple-600">{discount}</p>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
      >
        {linkText}
      </a>
    </div>
  )
}

const PerksPage = () => {
  return (
    <LadderlyPageWrapper title="Perks">
      <div className="flex flex-col items-center justify-center">
        <h1 className="mb-4 mt-4 text-2xl font-semibold">Ladderly Perks!</h1>
        <h2 className="mb-3 text-xl">
          Earn a discount with recommended partners!
        </h2>
      </div>

      <div className="mx-auto grid grid-cols-1 gap-6 px-10 md:grid-cols-2 lg:grid-cols-3">
        {perks.map((perk, index) => (
          <div className="mx-auto">
            <PerkCard key={index} {...perk} />
          </div>
        ))}
      </div>
    </LadderlyPageWrapper>
  )
}

export default PerksPage
