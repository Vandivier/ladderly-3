'use client'

import { useQuery } from '@blitzjs/rpc'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { VotableTypeSelector } from '../../../votable/VotableTypeSelector'
import getVotableLeaders from '../queries/getVotableLeaders'
import { typeToSlug } from 'src/votable/utils'

const toTitleCase = (str) =>
  str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

const VotableLeaders = ({ votableType }) => {
  const [leaders] = useQuery(getVotableLeaders, { type: votableType })

  return (
    <div>
      <h2 className="mb-4 text-center text-2xl font-bold">
        Top {`${toTitleCase(votableType)}`} Honors
      </h2>
      <p className="my-4 max-w-[400px] text-sm">
        These are the top 10 {`${toTitleCase(votableType)}`} leaders based on
        their prestige score and registered user votes. Ties are sorted by name.
      </p>
      <Link
        href={`/vote/${typeToSlug(votableType)}`}
        className="text-blue-500 underline"
      >
        Click here to vote!
      </Link>
      <ul className="mt-4">
        {leaders.map((leader) => (
          <li key={leader.id}>
            <span className="font-bold">{leader.name}</span> -{' '}
            {leader.prestigeScore} points ({leader.registeredUserVotes}{' '}
            registered votes)
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function TopHonorsContent({
  initialType,
}: {
  initialType?: string
}) {
  const router = useRouter()
  const [votableType, setVotableType] = useState(initialType || 'COMPANY')

  const handleVotableTypeChange = (newType) => {
    setVotableType(newType)
    router.push(`/top-honors/${typeToSlug(newType)}`)
  }

  return (
    <>
      <div className="m-auto my-4">
        <VotableTypeSelector
          value={votableType}
          onChange={handleVotableTypeChange}
        />
      </div>
      <VotableLeaders votableType={votableType} />
    </>
  )
}
