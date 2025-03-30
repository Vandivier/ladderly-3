import Link from 'next/link'
import { LargeCard } from '~/app/core/components/LargeCard'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'

export const metadata = {
  title: 'Privacy Policy',
}

const PrivacyPolicyPage = () => {
  return (
    <LadderlyPageWrapper>
      <LargeCard>
        <h1 className="mb-4 text-2xl font-semibold">Ladderly Privacy Policy</h1>
        <h2>Including Terms and Conditions</h2>

        <h2 className="mb-3 mt-5 text-xl">
          Does ladderly.io collect anonymous data?
        </h2>
        <p>
          When you use the ladderly.io website, we may collect some anonymous
          data to understand how users interact with ladderly.io site. Such
          information may include the browser you are using and which pages you
          have visited.
        </p>

        <h2 className="mb-3 mt-5 text-xl">
          In what situations does ladderly.io collect personal data?
        </h2>
        <p>
          If you create a ladderly.io account, we collect some personal data to
          track your progress and to customize your user experience. If you
          subscribe to our newsletter or email updates, we collect your email
          address.
        </p>

        <h2 className="mb-3 mt-5 text-xl">
          Can I use ladderly.io anonymously?
        </h2>
        <p>
          Yes, you can access ladderly.io resources without creating an account.
          Without an account, no personal data about you is collected.
        </p>

        <h2 className="mb-3 mt-5 text-xl">
          If I create an account, what data will you collect?
        </h2>
        <p>
          A valid email address is required to create an account. You can also
          add more information about yourself in your{' '}
          <Link href="/settings" className="underline">
            user settings page
          </Link>
          , though this is entirely optional.
        </p>

        <h2 className="mb-3 mt-5 text-xl">
          Can any other organizations access my data?
        </h2>
        <p>
          We do not sell your data, though we do utilize some third party tools.
          For example, ladderly.io utilizes{' '}
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-link-fancy"
          >
            Vercel
          </a>{' '}
          and{' '}
          <a
            href="https://supabase.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-link-fancy"
          >
            Supabase
          </a>
          . You can check their respective privacy policies for assurance.
        </p>

        <h2 className="mb-3 mt-5 text-xl">
          I have questions about my privacy on Ladderly
        </h2>
        <p>
          We{`'`}re here to help. Reach out at{' '}
          <a className="underline" href="mailto:admin@ladderly.io">
            admin@ladderly.io
          </a>
          .
        </p>

        <h2 className="mb-3 mt-5 text-xl">How can I find out about changes?</h2>
        <p>
          This version of the ladderly.io privacy Q&A was last updated on
          3/29/2025. Keep an eye on your emails for any future updates or
          changes.
        </p>
      </LargeCard>
    </LadderlyPageWrapper>
  )
}

export default PrivacyPolicyPage
