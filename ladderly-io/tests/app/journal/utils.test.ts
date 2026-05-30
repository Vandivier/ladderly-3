import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  invalidateJournalCaches,
  resolveGitHubIssueUrl,
} from '~/app/journal/utils'

describe('resolveGitHubIssueUrl', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns null for a plain string', async () => {
    expect(await resolveGitHubIssueUrl('Fix the login bug')).toBeNull()
  })

  it('returns null for a non-GitHub URL', async () => {
    expect(
      await resolveGitHubIssueUrl('https://example.com/issues/1'),
    ).toBeNull()
  })

  it('returns null for a GitHub repo URL (no issues path)', async () => {
    expect(
      await resolveGitHubIssueUrl('https://github.com/Vandivier/ladderly-3'),
    ).toBeNull()
  })

  it('returns null for a GitHub PR URL', async () => {
    expect(
      await resolveGitHubIssueUrl(
        'https://github.com/Vandivier/ladderly-3/pull/649',
      ),
    ).toBeNull()
  })

  it('fetches the issue and returns formatted taskName and issueUrl', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ title: 'Remove protectedProcedure' }),
    } as Response)

    const result = await resolveGitHubIssueUrl(
      'https://github.com/Vandivier/ladderly-3/issues/649',
    )

    expect(result).toEqual({
      taskName: 'Remove protectedProcedure #649',
      issueUrl: 'https://github.com/Vandivier/ladderly-3/issues/649',
    })
    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/Vandivier/ladderly-3/issues/649',
    )
  })

  it('trims the URL before processing', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ title: 'Some issue' }),
    } as Response)

    const result = await resolveGitHubIssueUrl(
      '  https://github.com/Vandivier/ladderly-3/issues/1  ',
    )

    expect(result?.issueUrl).toBe(
      'https://github.com/Vandivier/ladderly-3/issues/1',
    )
  })

  it('truncates taskName to 50 characters', async () => {
    const longTitle = 'A'.repeat(60)
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ title: longTitle }),
    } as Response)

    const result = await resolveGitHubIssueUrl(
      'https://github.com/Vandivier/ladderly-3/issues/1',
    )

    expect(result?.taskName).toHaveLength(50)
  })

  it('returns null when the API response is not ok', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
    } as Response)

    expect(
      await resolveGitHubIssueUrl(
        'https://github.com/Vandivier/ladderly-3/issues/649',
      ),
    ).toBeNull()
  })

  it('returns null when fetch throws', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

    expect(
      await resolveGitHubIssueUrl(
        'https://github.com/Vandivier/ladderly-3/issues/649',
      ),
    ).toBeNull()
  })
})

describe('invalidateJournalCaches', () => {
  it('calls getUserEntries.invalidate and getUserTasks.invalidate', async () => {
    const invalidateEntries = vi.fn().mockResolvedValue(undefined)
    const invalidateTasks = vi.fn().mockResolvedValue(undefined)

    await invalidateJournalCaches({
      journal: {
        getUserEntries: { invalidate: invalidateEntries },
        getUserTasks: { invalidate: invalidateTasks },
      },
    })

    expect(invalidateEntries).toHaveBeenCalledOnce()
    expect(invalidateTasks).toHaveBeenCalledOnce()
  })

  it('calls both invalidations in parallel', async () => {
    const order: string[] = []
    const invalidateEntries = vi.fn().mockImplementation(async () => {
      order.push('entries')
    })
    const invalidateTasks = vi.fn().mockImplementation(async () => {
      order.push('tasks')
    })

    await invalidateJournalCaches({
      journal: {
        getUserEntries: { invalidate: invalidateEntries },
        getUserTasks: { invalidate: invalidateTasks },
      },
    })

    // Both were called regardless of order (Promise.all, not sequential)
    expect(order).toContain('entries')
    expect(order).toContain('tasks')
  })
})
