import Link from 'next/link'

export const PleaseLoginComponent = () => (
  <div className="text-left">
    <h2 className="mb-4 text-2xl font-bold">Join Our Community!</h2>
    <p className="mb-4">
      <span className="underline">
        Sign up or log in to view detailed questions and answers
      </span>
      , ask your own questions, and publish your own answers.
    </p>
    <div className="my-4 space-x-4">
      <Link
        href="/login"
        className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
      >
        Log In
      </Link>
      <Link
        href="/signup"
        className="rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700"
      >
        Sign Up
      </Link>
    </div>
    <p className="mb-4">
      Your questions and answers will earn reputation points, showcasing your
      expertise and value to the community.
    </p>
    <p className="mb-4">
      Your reputation on Ladderly.io makes a wonderful addition to your
      portfolio, complimenting your contributions on GitHub, Stack Overflow, and
      other tech knowledge platforms!
    </p>
    <p className="mb-4">
      If you are an expert, this is an opportunity to give back. If you are an
      early career individual or student, this is also an opportunity for you to
      contribute! A well-formed question is often just as valuable as an expert
      answer.
    </p>
  </div>
)
