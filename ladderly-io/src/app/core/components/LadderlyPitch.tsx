import Link from 'next/link'

export const LadderlyPitch = () => (
  <div className="container mx-auto max-w-3xl px-4 py-8">
    <p className="text-center text-gray-800">
      Please{' '}
      <Link href="/signup" className="text-blue-600 hover:underline">
        sign up
      </Link>{' '}
      or{' '}
      <Link href="/login" className="text-blue-600 hover:underline">
        log in
      </Link>{' '}
      to continue.
    </p>

    <p className="mt-4 text-center text-gray-800">
      Ladderly.io is available for free. Sign up for{' '}
      <Link
        className="text-blue-600 hover:underline"
        href="/blog/2025-03-16-benefits-of-premium"
      >
        Ladderly Premium
      </Link>{' '}
      to access even more features!
    </p>
  </div>
)
