import { BlitzPage } from "@blitzjs/next"
import { LargeCard } from "src/core/components/LargeCard"
import { LadderlyPageWrapper } from "src/core/components/page-wrapper/LadderlyPageWrapper"

const PrivacyPolicyPage: BlitzPage = () => {
  return (
    <LadderlyPageWrapper title="Ladderly | Privacy Policy">
      <LargeCard>
        {/* <div className="container mx-auto mt-5 px-4"> */}
        <h1 className="mb-4 text-2xl font-semibold">
          ladderly.io Privacy Policy: Questions and Answers
        </h1>

        <p>We take your privacy seriously. And we give you full control over your data.</p>

        <h2 className="mb-3 mt-5 text-xl">Does ladderly.io collect anonymous data?</h2>
        <p>
          When you use the ladderly.io website, we may collect some anonymous data to understand how
          users interact with ladderly.io and insights such as the browser they are using.
        </p>

        <h2 className="mb-3 mt-5 text-xl">
          In what situations does ladderly.io collect personal data?
        </h2>
        <p>
          If you create a ladderly.io account, we collect some personal data to track your progress
          and to customize your user experience.
        </p>

        <h2 className="mb-3 mt-5 text-xl">Can I use ladderly.io anonymously?</h2>
        <p>
          Yes, you can access ladderly.io resources without creating an account. Without an account,
          no personal data about you is collected.
        </p>

        <h2 className="mb-3 mt-5 text-xl">If I create an account, what data will you collect?</h2>
        <p>
          We{`'`}ll request your email address for sign-in purposes and occasional updates. You can
          also add more about yourself in your user profile, though this is entirely optional.
        </p>

        <h2 className="mb-3 mt-5 text-xl">
          You said I have full control over my data. What does that mean, exactly?
        </h2>
        <p>
          You can download all your data in JSON format anytime, control your profile visibility,
          and delete any personal data or even your entire account.
        </p>

        {/* ... Other Q&A sections ... */}

        <h2 className="mb-3 mt-5 text-xl">Can any other organizations access my data?</h2>
        <p>
          We don{`'`}t sell your data. We utilize services like AWS and Auth0, and while your data
          may pass through them, you can always check their respective privacy policies for
          assurance.
        </p>

        <h2 className="mb-3 mt-5 text-xl">I have questions about my privacy on ladderly.io.</h2>
        <p>
          We{`'`}re here to help. Reach out at{" "}
          <a href="mailto:privacy@ladderly.io">privacy@ladderly.io</a>.
        </p>

        <h2 className="mb-3 mt-5 text-xl">How can I find out about changes?</h2>
        <p>
          This version of the ladderly.io privacy Q&A was last updated on [insert latest date here].
          Keep an eye on your emails for any future updates or changes.
        </p>
        {/* </div> */}
      </LargeCard>
    </LadderlyPageWrapper>
  )
}

export default PrivacyPolicyPage
