import { LadderlyPageWrapper } from 'src/core/components/page-wrapper/LadderlyPageWrapper'

interface Perk {
  title: string
  description: string
  discount?: string
  link: string
  linkText: string
  promoCode?: string
}

const perks: Perk[] = [
  {
    title: 'Codecademy',
    discount: '50% off',
    description:
      'Learn to code with Codecademy! They have free and paid options. Use this code to get a whopping 50% off their premium content!',
    link: 'https://codecademy.referralrock.com/l/JOHN07/',
    linkText: '50% off',
  },
  {
    title: 'Taro',
    description:
      'Taro helps software engineers accelerate their careers by providing expert advice, targeted skill development, and a supportive community to support professional and technical growth!',
    discount: '20% off',
    link: 'https://www.jointaro.com/r/johnv099/',
    linkText: 'Redeem your 20% discount',
  },
  {
    title: 'BrandGhost',
    description:
      'BrandGhost enables consistent social media engagement with low effort, leading to a larger network and more opportunities for you!',
    discount: '10% off',
    link: 'https://www.brandghost.ai/',
    linkText: 'Redeem your 10% discount',
    promoCode: 'VANDIBGAFF',
  },
  {
    title: 'Interviewing.io',
    description:
      'Anonymous mock interviews with Senior/Staff/Principal engineers from FAANG. Get feedback from the same people who make hiring decisions at top companies.',
    discount: '$100 off',
    link: 'https://iio.sh/r/1OhF',
    linkText: 'Redeem your $100 discount',
  },
  {
    title: 'Restream',
    description:
      'Restream allows you to stream video to multiple platforms at once!',
    discount: '$10 in credits',
    link: 'https://restream.io/join/9WkKx',
    linkText: 'Redeem your $10 in credits',
  },
  {
    title: 'VidIQ',
    description:
      'VidIQ helps you improve your YouTube channel and save valuable time! Once Ladderly.io makes 11 sales through this link we will qualify for a significant discount for additional sales.',
    link: 'https://vidiq.com/ladderlyio',
    linkText: 'Support the community',
  },
]

const PerkCard = ({
  title,
  description,
  discount,
  link,
  linkText,
  promoCode,
}: Perk) => {
  return (
    <div className="mb-6 rounded-lg border bg-white p-4 shadow-md">
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="mb-3 text-sm text-gray-700">{description}</p>

      {discount ? (
        <p className="mb-3 font-bold text-purple-600">
          {discount}{' '}
          {promoCode ? (
            <span className="italic">
              with Promo Code: <span className="font-bold">{promoCode}</span>
            </span>
          ) : (
            'using the link below'
          )}
        </p>
      ) : (
        <p className="mb-3">
          No discount currently - but you are helping the community!
        </p>
      )}

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
          <div className="mx-auto w-full" key={index}>
            <PerkCard {...perk} />
          </div>
        ))}
      </div>
    </LadderlyPageWrapper>
  )
}

export default PerksPage
