const GITHUB_ISSUE_RE =
  /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)\/?$/

export async function resolveGitHubIssueUrl(
  url: string,
): Promise<{ taskName: string; issueUrl: string } | null> {
  const match = GITHUB_ISSUE_RE.exec(url.trim())
  if (!match) return null
  const [, owner, repo, num] = match
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues/${num}`,
    )
    if (!res.ok) return null
    const data = (await res.json()) as { title: string }
    const taskName = `${data.title} #${num}`.slice(0, 50)
    return { taskName, issueUrl: url.trim() }
  } catch {
    return null
  }
}

export async function invalidateJournalCaches(utils: {
  journal: {
    getUserEntries: { invalidate: () => Promise<void> }
    getUserTasks: { invalidate: () => Promise<void> }
  }
}) {
  await Promise.all([
    utils.journal.getUserEntries.invalidate(),
    utils.journal.getUserTasks.invalidate(),
  ])
}
