'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'
import { api } from '~/trpc/react'

type JobPostOwnerActionsProps = {
  postId: number
  isExpired: boolean
}

export const JobPostOwnerActions = ({
  postId,
  isExpired,
}: JobPostOwnerActionsProps) => {
  const router = useRouter()
  const utils = api.useUtils()

  const refresh = async () => {
    await utils.jobBoard.invalidate()
    router.refresh()
  }

  const renewMutation = api.jobBoard.renew.useMutation({
    onSuccess: refresh,
  })
  const deleteMutation = api.jobBoard.delete.useMutation({
    onSuccess: async () => {
      await utils.jobBoard.invalidate()
      router.push('/jobs/mine')
      router.refresh()
    },
  })

  const handleDelete = () => {
    if (window.confirm('Delete this job post? This cannot be undone.')) {
      deleteMutation.mutate({ id: postId })
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <Link
        href={`/jobs/${postId}/edit`}
        className="rounded-md bg-blue-500 px-3 py-1.5 text-white hover:bg-blue-600"
      >
        Edit
      </Link>
      {isExpired && (
        <button
          onClick={() => renewMutation.mutate({ id: postId })}
          disabled={renewMutation.isPending}
          className="rounded-md bg-green-600 px-3 py-1.5 text-white hover:bg-green-700 disabled:opacity-50"
        >
          {renewMutation.isPending ? 'Renewing...' : 'Renew for 1 Month'}
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={deleteMutation.isPending}
        className="rounded-md bg-red-600 px-3 py-1.5 text-white hover:bg-red-700 disabled:opacity-50"
      >
        {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  )
}
