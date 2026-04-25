---
name: deny-default-git-writes
description: >-
  Denies agent-driven git commits, push, and history-mutating operations by
  default; read-only git and gh, plus explicitly allowlisted gh commands in
  other project skills, are allowed. Use when the agent may run git or gh, or
  when the user’s request could imply committing, pushing, merging, or opening
  / merging pull requests on their behalf.
---

# Default deny: agent-driven git and GitHub writes

This repository’s default is **no** agent-initiated writes to git history or remotes, and **no** `gh` commands that achieve the same (merge PRs, create PRs, push, etc.).

## Unless the user explicitly requests it in the current message

**Do not** run:

- `git commit`, `git push`, `git merge`, `git rebase`, `git cherry-pick`, `git reset` (when rewriting history or discarding in ways that need user intent), `git tag` (creating), or other commands whose primary effect is to mutate local history or update remote refs.
- `gh` flows that merge PRs, create PRs, push branches, or trigger automation whose purpose is to land commits, unless a **different** project skill documents an allowlist and the user asked for that workflow.

**Allowed without asking again in the same turn:** read-only use such as `git status`, `git diff`, `git log`, `git rev-parse`, `gh issue list`, `gh search issues`, and other **read** operations.

**Exception:** A project skill may define a **strict allowlist** of `gh` subcommands (for example `match-or-create-github-issue` allows `gh issue create` only after explicit in-chat confirmation). Follow that skill when it applies; it does not override the default deny for `git commit` / `git push` / etc.

**Consent does not carry forward:** If the user asked to commit in an earlier message, that does not authorize commits in a later message unless they ask again clearly.

## Limitations

Skills guide behavior; they are not a technical sandbox. Use Cursor permissions and team policy where enforcement is required.
