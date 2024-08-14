'use client'

import { useQuery } from '@blitzjs/rpc'
import React, { Suspense, useState } from 'react'
import { LadderlyPageWrapper } from 'src/core/components/page-wrapper/LadderlyPageWrapper'
import { VotableTypeSelector } from 'src/votable/VotableTypeSelector'
import getVotableLeaders from './queries/getVotableLeaders'

const toTitleCase = (str) =>
  str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

const VotableLeaders = ({ type }) => {
  const [leaders] = useQuery(getVotableLeaders, { type })

  return (
    <div>
      <h2 className="mb-4 text-center text-2xl font-bold">
        Top {`${toTitleCase(type)}`} Honors
      </h2>
      <p className="my-4 max-w-[400px] text-sm">
        These are the top 10 {`${toTitleCase(type)}`} leaders based on their
        prestige score and registered user votes. Ties are sorted by name.
      </p>
      <ul>
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

export default function TopHonorsPage() {
  const [votableType, setVotableType] = useState('COMPANY')

  return (
    <LadderlyPageWrapper title="Top Honors">
      <main className="m-4 flex flex-col items-center justify-center">
        <div className="m-auto my-4">
          <VotableTypeSelector value={votableType} onChange={setVotableType} />
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <VotableLeaders type={votableType} />
        </Suspense>
      </main>
    </LadderlyPageWrapper>
  )
}
