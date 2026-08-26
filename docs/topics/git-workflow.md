# Git Workflow

Use small, reviewable branches and commits.

```text
git switch -c feat/structured-estimates
git add server/ docs/
git commit -m "feat: enforce structured cost estimates"
git push -u origin feat/structured-estimates
```

Before opening a pull request:

1. Run syntax checks and focused tests.
2. Review `git diff` for secrets and unrelated changes.
3. Explain behavior, validation, and test evidence in the PR.
4. Rebase or merge the current base branch according to team policy.

Never commit `.env`, generated credentials, or large build artifacts. Prefer imperative commit messages and one logical change per commit.
