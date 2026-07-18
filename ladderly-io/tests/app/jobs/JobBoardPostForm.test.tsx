import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { JobBoardPostForm } from '~/app/jobs/components/JobBoardPostForm'

const {
  mockPush,
  mockRefresh,
  mockInvalidate,
  mockCreateMutate,
  mockUpdateMutate,
  mutationOptions,
} = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockRefresh: vi.fn(),
  mockInvalidate: vi.fn(),
  mockCreateMutate: vi.fn(),
  mockUpdateMutate: vi.fn(),
  mutationOptions: { create: null as any, update: null as any },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

vi.mock('~/trpc/react', () => ({
  api: {
    useUtils: () => ({
      jobBoard: { invalidate: mockInvalidate },
    }),
    jobBoard: {
      create: {
        useMutation: (opts: any) => {
          mutationOptions.create = opts
          return { mutate: mockCreateMutate, isPending: false }
        },
      },
      update: {
        useMutation: (opts: any) => {
          mutationOptions.update = opts
          return { mutate: mockUpdateMutate, isPending: false }
        },
      },
    },
  },
}))

const fillRequiredFields = () => {
  fireEvent.change(screen.getByLabelText('Company Name*'), {
    target: { value: '  Acme ' },
  })
  fireEvent.change(screen.getByLabelText('Job Title*'), {
    target: { value: 'Software Engineer' },
  })
}

describe('JobBoardPostForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('hides intro job families for direct-contact posts', () => {
    render(<JobBoardPostForm />)

    expect(screen.queryByText('Individual Contributor')).not.toBeInTheDocument()

    fireEvent.click(
      screen.getByLabelText(/willing to intro candidates/, { exact: false }),
    )

    expect(screen.getByText('Individual Contributor')).toBeInTheDocument()
    expect(screen.getByText('Engineering Manager')).toBeInTheDocument()
    expect(screen.getByText('Technical Recruiter')).toBeInTheDocument()
  })

  test('submits a trimmed create payload', () => {
    render(<JobBoardPostForm />)

    fillRequiredFields()
    fireEvent.change(screen.getByLabelText('Base Salary Min (USD/year)'), {
      target: { value: '150,000' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Post Job' }))

    expect(mockCreateMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        companyName: 'Acme',
        jobTitle: 'Software Engineer',
        description: null,
        jobPostUrl: null,
        baseSalaryMin: 150000,
        baseSalaryMax: null,
        contactType: 'POSTER',
        introJobFamilies: [],
      }),
    )
    expect(mockUpdateMutate).not.toHaveBeenCalled()
  })

  test('includes selected families for network-intro posts', () => {
    render(<JobBoardPostForm />)

    fillRequiredFields()
    fireEvent.click(
      screen.getByLabelText(/willing to intro candidates/, { exact: false }),
    )
    fireEvent.click(screen.getByLabelText('Engineering Manager'))
    fireEvent.click(screen.getByRole('button', { name: 'Post Job' }))

    expect(mockCreateMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        contactType: 'NETWORK_INTRO',
        introJobFamilies: ['ENGINEERING_MANAGER'],
      }),
    )
  })

  test('submits an update when editing an existing post', () => {
    render(
      <JobBoardPostForm
        postId={7}
        initialValues={{
          companyName: 'Acme',
          jobTitle: 'Software Engineer',
        }}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Update Job Post' }))

    expect(mockUpdateMutate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 7, companyName: 'Acme' }),
    )
    expect(mockCreateMutate).not.toHaveBeenCalled()
  })

  test('redirects and invalidates cache on success', async () => {
    render(<JobBoardPostForm />)

    await act(async () => {
      await mutationOptions.create.onSuccess({ id: 42 })
    })

    expect(mockInvalidate).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/jobs/42')
    expect(mockRefresh).toHaveBeenCalled()
  })

  test('shows the first zod field error on failure', async () => {
    render(<JobBoardPostForm />)

    await act(async () => {
      mutationOptions.create.onError({
        message: 'raw json blob',
        data: {
          zodError: {
            fieldErrors: {
              introJobFamilies: [
                'Select at least one job family you are willing to intro candidates to.',
              ],
            },
          },
        },
      })
    })

    expect(
      screen.getByText(
        'Select at least one job family you are willing to intro candidates to.',
      ),
    ).toBeInTheDocument()
  })

  test('falls back to the error message without zod details', async () => {
    render(<JobBoardPostForm />)

    await act(async () => {
      mutationOptions.create.onError({
        message: 'To post a job, enable your public profile.',
        data: null,
      })
    })

    expect(
      screen.getByText('To post a job, enable your public profile.'),
    ).toBeInTheDocument()
  })
})
