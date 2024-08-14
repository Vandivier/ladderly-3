'use client'

import React, { useState, Suspense } from 'react'
import { useQuery, useMutation } from '@blitzjs/rpc'
import { LadderlyPageWrapper } from 'src/core/components/page-wrapper/LadderlyPageWrapper'
import getRandomVotablePair from './queries/getRandomVotablePair'
import createVote from './mutations/createVote'

const VotePageContent = () => {
  const [votableType, setVotableType] = useState('COMPANY')
  const [votablePair, { refetch }] = useQuery(getRandomVotablePair, {
    type: votableType,
  })
  const [castVote] = useMutation(createVote)

  const votableA = votablePair?.[0]
  const votableB = votablePair?.[1]

  const handleVote = async (winnerId: number) => {
    if (votableA && votableB) {
      try {
        await castVote({
          winnerId,
          votableAId: votableA.id,
          votableBId: votableB.id,
        })
        await refetch()
      } catch (error) {
        console.error('Error casting vote:', error)
      }
    } else {
      console.error('Invalid votable pair.')
    }
  }

  if (!votableA || !votableB) {
    return <p>Loading votable items...</p>
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="m-4 text-2xl font-bold">
        Vote for the more prestigious option!
      </h1>

      <div className="mb-4">
        <label htmlFor="votable-type" className="mr-2">
          Select Votable Type:
        </label>
        <select
          id="votable-type"
          value={votableType}
          onChange={(e) => setVotableType(e.target.value)}
          className="rounded border p-2"
        >
          <option value="COMPANY">Company</option>
          <option value="SCHOOL">School</option>
          <option value="SKILL">Skill</option>
        </select>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => handleVote(votableA.id)}
          className="rounded border bg-blue-500 p-4 text-white"
        >
          {votableA.name}
        </button>
        <button
          onClick={() => handleVote(votableB.id)}
          className="rounded border bg-blue-500 p-4 text-white"
        >
          {votableB.name}
        </button>
      </div>
      <button onClick={() => refetch()} className="m-4 text-blue-500 underline">
        Skip
      </button>
    </div>
  )
}

export default function VotePage() {
  return (
    <LadderlyPageWrapper title="Vote">
      <Suspense fallback={<div>Loading...</div>}>
        <VotePageContent />
      </Suspense>
    </LadderlyPageWrapper>
  )
}
