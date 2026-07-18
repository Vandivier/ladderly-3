---
name: create-issue
description: >-
  Given a task description, searches the current GitHub repository for existing
  issues that match the same work; reports title and URL when found, otherwise
  offers to create a new issue after user confirmation. Use when the user wants
  to avoid duplicate issues, check if work is already tracked, dedupe tasks
  against GitHub, or before filing a new issue from a task write-up. Only
  allowlisted gh subcommands may be run; see skill body.
---

# Match or create GitHub issue

## When to use

The user supplies a **task description** (plain language). Resolve the **current GitHub repo** from the working directory, search issues, judge whether any issue is the **same or clearly overlapping work**, then either link existing issues or offer to create one.

## GitHub CLI allowlist (mandatory)

**Only** the following `gh` invocations are permitted for this workflow. **Refuse** any other `gh` subcommand or flag pattern (including `gh pr`, `gh api`, `gh release`, `gh workflow`, `gh gist`, `gh repo` except as specified, etc.), even if the user asks.

| Allowed command    | Purpose                                                                                                                                                                                |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `gh auth status`   | Verify CLI auth (read)                                                                                                                                                                 |
| `gh repo view`     | Resolve `OWNER/REPO`; use only `--json` with fields like `nameWithOwner`, or `-q` querying those fields (read)                                                                         |
| `gh search issues` | Search issues; read-only flags only (`--repo`, `--limit`, `--json`, query string)                                                                                                      |
| `gh issue list`    | List issues; read-only flags only (`--repo`, `--state`, `--limit`, `--json`)                                                                                                           |
| `gh issue view`    | Show one issue; read-only (`gh issue view NUMBER --repo OWNER/REPO --json …`)                                                                                                          |
| `gh issue create`  | **Only** after the user explicitly confirms title and body in-chat. Use **`gh issue create --repo OWNER/REPO --title "…" --body "…"`** only. No `--web`, no piping from shell secrets. |

Do **not** use `gh pr view` or any PR/MR commands in this skill unless the project’s maintainers extend this allowlist.

## Git / commits (mandatory)

This skill must **not** invoke `git` or any tool to **create commits, push, merge, rebase, or otherwise mutate repository history**. That aligns with the project skill **`deny-default-git-writes`**. Finding the repo is done via **`gh repo view`** only (no `git commit` / `git push` / etc.).

## Prerequisites

- Working directory inside the git checkout (so `gh repo view` resolves the right repo).
- `gh auth status` succeeds.

## Workflow

### 1. Resolve repository

```bash
gh auth status
gh repo view --json nameWithOwner -q .nameWithOwner
```

Record `OWNER/REPO`. On failure, stop and tell the user to fix auth or directory.

### 2. Search for candidate issues

Build a short search query from the task: important nouns, feature names, error text, or identifiers—not the whole paragraph unless it is short.

```bash
gh search issues "is:issue is:open SEARCH_TERMS" --repo OWNER/REPO --limit 20 --json number,title,url,state
```

If needed, broaden (e.g. include closed):

```bash
gh search issues "is:issue SEARCH_TERMS" --repo OWNER/REPO --limit 20 --json number,title,url,state
```

Optional fallback when search is thin:

```bash
gh issue list --repo OWNER/REPO --state all --limit 30 --json number,title,url,state
```

Use **`gh issue view`** only when you need the body to judge overlap; stay within the allowlist.

### 3. Decide if something matches

Treat as a **match** when an issue is the **same problem, deliverable, or scoped change**—not the same vague area.

- **Strong match**: link it.
- **Weak / related**: mention as related, not duplicate.
- **No match**: offer creation.

### 4. Respond

**If matched:** list **title** and full issue **URL** (`url` from JSON, or `https://github.com/OWNER/REPO/issues/N`).

**If not matched:** propose title + body; **only** run **`gh issue create`** after explicit user confirmation.

### 5. Labels and assignees

Do not add labels or assignees unless the user asks (that could require non-allowlisted `gh` commands—default is omit).

## Safety

- No secrets or credentials in issue bodies.
- Do not close, edit, or bulk-modify issues (would require commands outside this allowlist).
