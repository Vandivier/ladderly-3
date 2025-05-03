import { LadderlyPageWrapper } from '../core/components/page-wrapper/LadderlyPageWrapper'

const FaqPage = () => {
  return (
    <LadderlyPageWrapper>
      <div className="flex flex-col items-center justify-center">
        <h1 className="my-4 text-2xl font-semibold">
          Frequently Asked Questions (FAQ)
        </h1>
      </div>

      <div className="mx-auto grid grid-cols-1 gap-6 px-10 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">What is Ladderly.io?</h2>
          <p className="text-gray-700">
            Ladderly.io is a comprehensive platform designed to help individuals
            advance their tech careers. We provide structured learning paths,
            mentorship opportunities, and a supportive community to help you
            achieve your professional goals in the technology industry.
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">
            Is Ladderly.io Just for Programmers?
          </h2>
          <p className="text-gray-700">
            No, Ladderly.io is designed for anyone looking to build a career in
            tech, including career switchers from any industry. We provide
            comprehensive support that includes both technical skill development
            and essential professional skills like time management,
            communication, and project management. Our platform helps you build
            a strong foundation for success in the tech industry, regardless of
            your background.
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">
            What Benefits Does Ladderly.io Offer Free and Premium Members?
          </h2>
          <p className="text-gray-700">
            TODO FIXME Free members have access to basic resources, community
            forums, and some learning materials. Premium members enjoy
            additional benefits including exclusive content, priority mentorship
            matching, advanced learning paths, and access to premium community
            features.
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">
            I Can't Access Premium Resources After Signing Up for Premium. What
            Should I Do?
          </h2>
          <p className="text-gray-700">
            If you're experiencing issues accessing premium content after
            upgrading, please try logging out and back in. If the issue
            persists, contact our support team through the help center, and
            we'll assist you promptly.
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Where is the Discord?</h2>
          <p className="text-gray-700">
            You can join our Discord community through the link in your account
            dashboard or by visiting our community page. The Discord server is
            where members can connect, share knowledge, and participate in
            community events.
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">
            Where are the Live Streams?
          </h2>
          <p className="text-gray-700">
            Our live streams are hosted on our platform and announced through
            our community channels. You can find upcoming streams in your
            dashboard and past recordings in our content library.
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">
            I Want Help with a Topic that Isn't Covered in the Blog. What Should
            I Do?
          </h2>
          <p className="text-gray-700">
            We encourage you to reach out through our community forums or
            contact our support team. We're always looking to expand our content
            based on community needs and feedback.
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">
            Where Can I Provide Website Feedback?
          </h2>
          <p className="text-gray-700">
            You can submit feedback through our feedback form in your account
            settings or by contacting our support team. We value your input and
            use it to continuously improve the platform.
          </p>
        </div>
      </div>
    </LadderlyPageWrapper>
  )
}

export default FaqPage
