'use client'

import { useMutation, useQuery } from '@blitzjs/rpc'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { VotableTypeSelector } from 'src/votable/VotableTypeSelector'
import createVote from '../mutations/createVote'
import getRandomVotablePair from '../queries/getRandomVotablePair'
import { typeToSlug } from 'src/votable/utils'

const VotePageContent = ({ initialType }: { initialType?: string }) => {
  const router = useRouter()
  const [votableType, setVotableType] = useState(initialType || 'COMPANY')
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

  const handleVotableTypeChange = (newType) => {
    setVotableType(newType)
    router.push(`/vote/${typeToSlug(newType)}`)
  }

  if (!votableA || !votableB) {
    return <p>Loading votable items...</p>
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="m-4 text-2xl font-bold">
        Vote for the more prestigious option!
      </h1>

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

export default VotePageContent
