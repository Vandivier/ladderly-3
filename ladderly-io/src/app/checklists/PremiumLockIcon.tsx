'use client'

import { LockIcon } from 'lucide-react'

export const PremiumLockIcon: React.FC<{
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}> = ({ onClick }) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    onClick(e)
  }

  return (
    <div className="flex items-center">
      <button
        onClick={handleClick}
        className="flex items-center justify-center rounded bg-ladderly-violet-100 p-1.5 text-ladderly-violet-500 transition-all hover:bg-ladderly-violet-500 hover:text-white"
      >
        <LockIcon className="size-4" />
      </button>
    </div>
  )
}
