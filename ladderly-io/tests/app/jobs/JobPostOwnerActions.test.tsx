import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { JobPostOwnerActions } from '~/app/jobs/components/JobPostOwnerActions'

const { mockRenewMutate, mockDeleteMutate } = vi.hoisted(() => ({
  mockRenewMutate: vi.fn(),
  mockDeleteMutate: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

vi.mock('~/trpc/react', () => ({
  api: {
    useUtils: () => ({
      jobBoard: { invalidate: vi.fn() },
    }),
    jobBoard: {
      renew: {
        useMutation: () => ({ mutate: mockRenewMutate, isPending: false }),
      },
      delete: {
        useMutation: () => ({ mutate: mockDeleteMutate, isPending: false }),
      },
    },
  },
}))

describe('JobPostOwnerActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('links to the edit page', () => {
    render(<JobPostOwnerActions postId={5} isExpired={false} />)

    expect(screen.getByRole('link', { name: 'Edit' })).toHaveAttribute(
      'href',
      '/jobs/5/edit',
    )
  })

  test('only offers renew for expired posts', () => {
    const { rerender } = render(
      <JobPostOwnerActions postId={5} isExpired={false} />,
    )
    expect(screen.queryByText('Renew for 1 Month')).not.toBeInTheDocument()

    rerender(<JobPostOwnerActions postId={5} isExpired={true} />)
    fireEvent.click(screen.getByText('Renew for 1 Month'))
    expect(mockRenewMutate).toHaveBeenCalledWith({ id: 5 })
  })

  test('deletes only after confirmation', () => {
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)

    render(<JobPostOwnerActions postId={5} isExpired={false} />)

    fireEvent.click(screen.getByText('Delete'))
    expect(mockDeleteMutate).not.toHaveBeenCalled()

    fireEvent.click(screen.getByText('Delete'))
    expect(mockDeleteMutate).toHaveBeenCalledWith({ id: 5 })

    expect(confirmSpy).toHaveBeenCalledTimes(2)
  })
})
