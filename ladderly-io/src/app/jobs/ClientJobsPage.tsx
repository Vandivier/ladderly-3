'use client'

import { IntroJobFamily, JobBoardContactType } from '@prisma/client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState } from 'react'
import { api } from '~/trpc/react'
import {
  INTRO_JOB_FAMILY_LABELS,
  describeContactBadge,
  formatPosterName,
  formatSalaryRange,
} from './utils'

const ITEMS_PER_PAGE = 10

const isContactType = (value: string | null): value is JobBoardContactType =>
  value !== null && value in JobBoardContactType

const isIntroJobFamily = (value: string | null): value is IntroJobFamily =>
  value !== null && value in IntroJobFamily

export const ClientJobsPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams() ?? new URLSearchParams()

  const rawPage = parseInt(searchParams.get('page') ?? '0')
  const page = isNaN(rawPage) || rawPage < 0 ? 0 : rawPage
  const searchTerm = searchParams.get('q') ?? ''
  const contactTypeParam = searchParams.get('contactType')
  const contactType = isContactType(contactTypeParam)
    ? contactTypeParam
    : undefined
  const familyParam = searchParams.get('family')
  const introJobFamily = isIntroJobFamily(familyParam)
    ? familyParam
    : undefined
  const rawMinSalary = parseInt(searchParams.get('minSalary') ?? '')
  const minSalary =
    isNaN(rawMinSalary) || rawMinSalary <= 0 ? undefined : rawMinSalary
  const sortBy =
    searchParams.get('sort') === 'salaryDesc' ? 'salaryDesc' : 'newest'

  const [searchInput, setSearchInput] = useState(searchTerm)
  const [minSalaryInput, setMinSalaryInput] = useState(
    minSalary?.toString() ?? '',
  )

  const { data, isLoading } = api.jobBoard.getPosts.useQuery({
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
    searchTerm: searchTerm === '' ? undefined : searchTerm,
    contactType,
    introJobFamily,
    minSalary,
    sortBy,
  })

  const posts = data?.posts ?? []
  const hasMore = data?.hasMore ?? false

  const updateSearchParams = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        newParams.delete(key)
      } else {
        newParams.set(key, value)
      }
    })
    router.push(`/jobs?${newParams.toString()}`)
  }

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault()
    const parsedMinSalary = parseInt(minSalaryInput.replace(/[^0-9]/g, ''))
    updateSearchParams({
      q: searchInput.trim() === '' ? null : searchInput.trim(),
      minSalary:
        isNaN(parsedMinSalary) || parsedMinSalary <= 0
          ? null
          : parsedMinSalary.toString(),
      page: '0',
    })
  }

  return (
    <div>
      <form onSubmit={applyFilters} className="mb-4 flex flex-wrap gap-2">
        <input
          className="grow rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
          placeholder="Search by title or company"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <input
          className="w-40 rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
          placeholder="Min salary"
          inputMode="numeric"
          value={minSalaryInput}
          onChange={(e) => setMinSalaryInput(e.target.value)}
        />
        <button
          type="submit"
          className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Search
        </button>
      </form>

      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium">Contact:</span>
        {Object.values(JobBoardContactType).map((type) => (
          <button
            key={type}
            onClick={() =>
              updateSearchParams({
                contactType: contactType === type ? null : type,
                page: '0',
              })
            }
            className={`rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 transition-colors hover:opacity-80 ${
              contactType === type ? 'ring-2 ring-offset-2' : ''
            }`}
          >
            {type === JobBoardContactType.POSTER
              ? 'Direct Contact'
              : 'Intro Available'}
          </button>
        ))}
        <span className="ml-2 font-medium">Intro to:</span>
        {Object.values(IntroJobFamily).map((family) => (
          <button
            key={family}
            onClick={() =>
              updateSearchParams({
                family: introJobFamily === family ? null : family,
                page: '0',
              })
            }
            className={`rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800 transition-colors hover:opacity-80 ${
              introJobFamily === family ? 'ring-2 ring-offset-2' : ''
            }`}
          >
            {INTRO_JOB_FAMILY_LABELS[family]}
          </button>
        ))}
        <span className="ml-2 font-medium">Sort:</span>
        <button
          onClick={() =>
            updateSearchParams({
              sort: sortBy === 'salaryDesc' ? null : 'salaryDesc',
              page: '0',
            })
          }
          className={`rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 transition-colors hover:opacity-80 ${
            sortBy === 'salaryDesc' ? 'ring-2 ring-offset-2' : ''
          }`}
        >
          Highest Salary
        </button>
      </div>

      {isLoading ? (
        <div className="p-4">Loading...</div>
      ) : posts.length > 0 ? (
        <ul className="my-4 space-y-4">
          {posts.map((post) => {
            const salaryRange = formatSalaryRange(
              post.baseSalaryMin,
              post.baseSalaryMax,
            )

            return (
              <li
                key={post.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <Link
                  href={`/jobs/${post.id}`}
                  className="text-lg font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  {post.jobTitle} at {post.companyName}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  {post.location && <span>{post.location}</span>}
                  {post.isRemote && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                      Remote
                    </span>
                  )}
                  {salaryRange && <span>{salaryRange}</span>}
                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                    {describeContactBadge(
                      post.contactType,
                      post.introJobFamilies,
                    )}
                  </span>
                </div>
                <p className="mt-2 text-sm">
                  Posted by{' '}
                  <Link
                    href={`/community/${post.author.id}`}
                    className="underline"
                  >
                    {formatPosterName(post.author)}
                  </Link>{' '}
                  on {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="p-2">
          No jobs found. Have a lead?{' '}
          <Link className="underline" href="/jobs/post">
            Post the first one!
          </Link>
        </p>
      )}

      <div className="mt-6 flex gap-4">
        {page > 0 && (
          <button
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            onClick={() => updateSearchParams({ page: (page - 1).toString() })}
          >
            Previous
          </button>
        )}
        {hasMore && (
          <button
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            onClick={() => updateSearchParams({ page: (page + 1).toString() })}
          >
            Next
          </button>
        )}
      </div>
    </div>
  )
}
