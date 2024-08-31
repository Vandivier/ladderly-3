'use client'

import { useMutation, useQuery } from '@blitzjs/rpc'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { typeToSlug } from 'src/votable/utils'
import { VotableTypeSelector } from 'src/votable/VotableTypeSelector'
import createVote from '../mutations/createVote'
import getRandomVotablePair from '../queries/getRandomVotablePair'

const VotePageContent = ({ initialType }: { initialType?: string }) => {
  const router = useRouter()
  const [votableType, setVotableType] = useState(initialType || 'COMPANY')
  const [votablePair, { refetch }] = useQuery(getRandomVotablePair, {
    type: votableType,
  })
  const [castVote] = useMutation(createVote)

  const votableA = votablePair?.[0]
  const votableB = votablePair?.[1]

  const handleVote = async (
    votableId: number,
    voteType: 'UPVOTE' | 'DOWNVOTE',
    loserId?: number
  ) => {
    try {
      await castVote({
        votableId,
        voteType,
        loserId,
      })
      await refetch()
    } catch (error) {
      console.error('Error casting vote:', error)
    }
  }

  const handleVotableTypeChange = (newType) => {
    setVotableType(newType)
    router.push(`/vote/${typeToSlug(newType)}`)
  }

  if (!votableA || !votableB) {
    return <p>Loading votable items...</p>
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="m-4 text-2xl font-bold">Vote on these options!</h1>

      <VotableTypeSelector
        value={votableType}
        onChange={handleVotableTypeChange}
      />

      <Link
        href={`/top-honors/${typeToSlug(votableType)}`}
        className="my-4 text-blue-500 underline"
      >
        View current leaders here!
      </Link>

      <div className="flex space-x-8">
        {[votableA, votableB].map((votable) => (
          <div key={votable.id} className="flex flex-col items-center">
            <h2 className="mb-2 text-lg font-semibold">{votable.name}</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => handleVote(votable.id, 'UPVOTE')}
                className="rounded border bg-green-500 p-2 text-white"
              >
                Upvote
              </button>
              <button
                onClick={() => handleVote(votable.id, 'DOWNVOTE')}
                className="rounded border bg-red-500 p-2 text-white"
              >
                Downvote
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => handleVote(votableA.id, 'UPVOTE', votableB.id)}
        className="mt-4 rounded border bg-blue-500 p-2 text-white"
      >
        {votableA.name} is better
      </button>
      <button
        onClick={() => handleVote(votableB.id, 'UPVOTE', votableA.id)}
        className="mt-2 rounded border bg-blue-500 p-2 text-white"
      >
        {votableB.name} is better
      </button>

      <button onClick={() => refetch()} className="m-4 text-blue-500 underline">
        Skip to next pair
      </button>
    </div>
  )
}

export default VotePageContent
