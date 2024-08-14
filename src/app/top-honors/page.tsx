'use client'

import { useQuery } from '@blitzjs/rpc'
import React, { Suspense, useState } from 'react'
import { LadderlyPageWrapper } from 'src/core/components/page-wrapper/LadderlyPageWrapper'
import getVotableLeaders from './queries/getVotableLeaders'

const toTitleCasePlural = (str) => {
  let pluralized

  if (str.toLowerCase().endsWith('y')) {
    pluralized = str.slice(0, -1) + 'ies'
  } else {
    pluralized = str + 's'
  }

  return pluralized.charAt(0).toUpperCase() + pluralized.slice(1).toLowerCase()
}

const VotableLeaders = ({ type }) => {
  const [leaders] = useQuery(getVotableLeaders, { type })

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">
        Top {`${toTitleCasePlural(type)}`}
      </h2>
      <ul>
        {leaders.map((leader) => (
          <li key={leader.id}>
            {leader.name} - {leader.prestigeScore} points ({leader.voteCount}{' '}
            votes)
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function TopHonorsPage() {
  const [selectedType, setSelectedType] = useState('COMPANY')

  return (
    <LadderlyPageWrapper title="Top Honors">
      <div className="flex flex-col items-center justify-center">
        <div className="mb-4">
          <label htmlFor="votable-type" className="mr-2">
            Select Votable Type:
          </label>
          <select
            id="votable-type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded border p-2"
          >
            <option value="COMPANY">Company</option>
            <option value="SCHOOL">School</option>
            <option value="SKILL">Skill</option>
          </select>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <VotableLeaders type={selectedType} />
        </Suspense>
      </div>
    </LadderlyPageWrapper>
  )
}
