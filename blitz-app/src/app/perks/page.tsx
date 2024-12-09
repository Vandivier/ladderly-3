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
    title: 'CareerFoundry',
    description:
      'CareerFoundry is top-rated coding bootcamp of the highest caliber, one of only two that Ladderly.io officially recommends, and they offer a job guarantee!',
    discount: '10% off and a guaranteed job!',
    link: 'https://careerfoundry.com/en/referral_registrations/new?referral=A7NKm6rk',
    linkText: 'Redeem your 10% discount',
  },
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
    title: 'Robinhood',
    description:
      'What goes better with a high-paying tech job than a high-quality investment account? Robinhood provides access to stocks, crypto, options, and more!',
    discount: 'Up to $200 in free stock',
    link: 'https://join.robinhood.com/johnv-19a478e6',
    linkText: 'Get $5-200 in free stock',
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
    title: 'DataExpert.io',
    description: `Interested in data engineering or analytics? Check out Zach Wilson's industry-leading course at DataExpert.io!`,
    discount: '20% off',
    link: 'https://dataexpert.io/JOHN20',
    linkText: 'Redeem your 20% discount',
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
    title: 'OpusClip',
    discount: 'Free Trial and Forever-Free Tier',
    description:
      'This tool automagically turns your long-form videos, such as a YouTube stream URL, into short-form video that you can post to YouTube shorts, TikTok, Instagram reels, and so on. It generates a description too. A real time saver!',
    link: 'https://www.opus.pro/?via=fa6c47',
    linkText: 'Claim your free trial',
  },
  {
    title: 'Repurpose.io',
    description: `When you post once to a social media channel like YouTube, Repurpose.io will automatically repost your content to other channels! It's a time saver and an impact multiplier.`,
    discount: '14-Day Free Trial',
    link: 'https://repurpose.io?fpr=98821',
    linkText: '14-Day Free Trial',
  },
  {
    title: 'StreamLabs',
    description:
      'StreamLabs can improve multi-streaming to TikTok, streamline your video editing workflow, and more!',
    discount: '7-Day Free Trial',
    link: 'https://streamlabs.pxf.io/09QnLR',
    linkText: 'Claim your 7-Day Free Trial',
  },
  {
    title: 'VidIQ',
    description:
      'VidIQ helps you improve your YouTube channel and save valuable time! They have a free tier and a paid tier. For the paid version, after Ladderly.io makes 11 sales through this link we will qualify for a significant discount for additional sales.',
    link: 'https://vidiq.com/ladderlyio',
    linkText: 'Support the community',
  },
  {
    title: 'Poplin Laundry Service',
    description:
      'Your time is valuable. Clean clothes win interviews and they smell good. This is why you should have someone else pick your laundry up, clean it, and deliver it to you.',
    discount: '$10 Credit',
    link: 'https://gopoplin.com/?referralId=dPasKp57usoUYkWnj0ji',
    linkText: 'Claim your $10 credit!',
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
        <p className="mb-4 font-bold text-purple-600">
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
        <p className="mb-4">
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
        <h2 className="mb-3 text-center text-xl">
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
