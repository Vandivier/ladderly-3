'use client'

import Image from 'next/image'
import { useTheme } from '~/app/core/theme/ThemeContext'

export const LadderlyHelpsBlock = () => {
  const { theme } = useTheme()

  return (
    <div>
      <h2 className="my-6 text-2xl font-bold">Ladderly Helps You:</h2>
      <ol className="flex list-none flex-col gap-3">
        <li className="flex items-center">
          <div className="mr-3 flex size-8 min-w-8 items-center justify-center rounded-full bg-purple-500/50">
            1
          </div>
          <span className="rounded-md bg-purple-300/20 p-2">learn to code</span>
        </li>
        <li className="flex items-center">
          <div className="mr-3 flex size-8 min-w-8 items-center justify-center rounded-full bg-purple-500/50">
            2
          </div>
          <span className="rounded-md bg-purple-300/20 p-2">
            land your first or next programming role
          </span>
        </li>
        <li className="flex items-center">
          <div className="mr-3 flex size-8 min-w-8 items-center justify-center rounded-full bg-purple-500/50">
            3
          </div>
          <span className="rounded-md bg-purple-300/20 p-2">
            grow social and professional networks
          </span>
        </li>
        <li className="m-3">
          <a
            href="https://www.producthunt.com/posts/ladderly-io?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-ladderly&#0045;io"
            target="_blank"
          >
            <Image
              src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=480223&theme=${theme}`}
              alt="Ladderly.io - Land your next programming role | Product Hunt"
              style={{ margin: 'auto' }}
              width="250"
              height="54"
            />
          </a>
        </li>
      </ol>
    </div>
  )
}
