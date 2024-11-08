// src/app/HomePageSkeleton.tsx

import styles from 'src/app/styles/Home.module.css'

const HomePageSkeleton = () => (
  <div className={styles.wrapper}>
    <div className="mx-auto my-6 flex animate-pulse flex-wrap gap-0 rounded-lg bg-frost p-2 sm:flex-nowrap sm:gap-16">
      <div className="m-auto block h-[270px] w-[270px] rounded-lg bg-gray-300 shadow-lg sm:hidden"></div>
      <div className="m-6 hidden h-[330px] w-[330px] rounded-lg bg-gray-300 shadow-lg sm:block"></div>
      <div className="w-full">
        <div className="mb-4 h-8 w-3/4 rounded bg-gray-300"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div className="mr-3 h-8 w-8 rounded-full bg-gray-300"></div>
              <div className="h-8 w-3/4 rounded bg-gray-300"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="space-y-4">
      <div
        className={`${styles['next-steps-card']} animate-pulse rounded-lg bg-white p-6 shadow-lg`}
      >
        <div className="mb-4 h-8 w-3/4 rounded bg-gray-300"></div>
        <div className="h-24 w-full rounded bg-gray-300"></div>
      </div>
      <div
        className={`${styles['next-steps-card']} animate-pulse rounded-lg bg-white p-2 shadow-lg`}
      >
        <div className="h-6 w-full rounded bg-gray-300"></div>
      </div>
      <div className="h-64 w-full animate-pulse rounded bg-gray-300"></div>
    </div>
  </div>
)

export default HomePageSkeleton
