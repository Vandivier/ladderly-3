'use client'

import { useQuery } from '@blitzjs/rpc'
import React, { Suspense, useState } from 'react'
import { LadderlyPageWrapper } from 'src/core/components/page-wrapper/LadderlyPageWrapper'
import getVotableLeaders from './queries/getVotableLeaders'

const toTitleCase = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()

const VotableLeaders = ({ type }) => {
  const [leaders] = useQuery(getVotableLeaders, { type })

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">
        Top {`${toTitleCase(type)}`} Honors
      </h2>
      <ul>
        {leaders.map((leader) => (
          <li key={leader.id}>
            {leader.name} - {leader.prestigeScore} points (
            {leader.registeredUserVotes} registered votes)
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
        <div className="m-4">
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
