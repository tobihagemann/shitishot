---
name: release
description: "Release a new version of shitishot: set the version in package.json when needed, push to main so CI deploys it to GitHub Pages, tag the deployed commit, and publish a GitHub release with notes. Use when the user asks to \"release\", \"cut a release\", \"release version X\", \"publish a new version\", \"tag a release\", or \"do a release\"."
---

# Release

Optional version: `$ARGUMENTS`

Versions are `MAJOR.MINOR.PATCH` with no `v` prefix. Every push to `main` runs CI, which deploys to GitHub Pages when it passes. Commits and tags are signed through the git config: keep signing enabled, and when it fails, use `AskUserQuestion` so the user can resolve it and have the command retried.

## Task Tracking

At the start, use `TaskCreate` to create a task for each step:

1. Check preconditions
2. Confirm version and release notes
3. Bump and deploy
4. Tag
5. Publish the GitHub release
6. Report

Wherever a step ends the release early, mark the remaining tasks deleted, then use the TaskList tool and proceed to any remaining task.

## Step 1: Check Preconditions

Run `git fetch origin --tags --prune`, then check for an interrupted release:

- A local tag that `git ls-remote --tags origin <tag>` does not list was created but never pushed
- The newest tag on `origin/main` (`git describe --tags --abbrev=0 origin/main`) without a GitHub release (`gh release view <tag>` fails) was pushed but never published

When either holds, state what was found as text. Then use `AskUserQuestion` to offer:

- **Resume** — for an unpushed tag, continue at Step 4 with its push; for a tag without a release, continue at Step 5. Reuse `.turbo/release/<version>-notes.md` when it exists, and otherwise write the notes as in Step 2 and ask for their approval first
- **Clean up** — delete the unpushed tag with `git tag -d <tag>`, then start over at Step 1; offer this only while the tag is not on `origin`
- **End here** — leave everything as it is

Otherwise confirm all of the following:

- The current branch is `main` and the working tree is clean
- `main` equals `origin/main`
- The CI workflow succeeded on the `main` head: `gh run list --workflow CI --branch main --event push --commit "$(git rev-parse main)" --limit 1 --json databaseId,conclusion,status`

When the CI run is still in progress, wait for it with the same `gh run watch` call as in Step 3, then check again. When another precondition does not hold, state which one as text. Then use `AskUserQuestion` to offer re-checking after the user has fixed it, or ending the release here.

## Step 2: Confirm Version and Release Notes

Find the last release with `git describe --tags --abbrev=0 origin/main`, and list what changed since: `git log --oneline <last-version>..main`. When resuming a pushed tag, use `git describe --tags --abbrev=0 <tag>^` and `git log --oneline <last-version>..<tag>` instead. Read the diff behind any commit whose effect on players the subject line leaves unclear.

**Version.** Use the provided version when there is one. Otherwise propose one: a major bump for a rebuild or a change that breaks existing share links, a minor bump when players get something new, a patch bump otherwise. The `version` in `package.json` may already name the intended version when a commit set it ahead of the release; treat it as a hint. The version must be greater than the last release, and `git tag --list <version>` must print nothing. When the version is lower than the one in `package.json`, say so in the approval text, since Step 3 lowers `package.json` to it.

**Release notes.** Write one bullet per change a player of the last release would notice. Treat a fix for something introduced since then as part of the change it fixes, and leave the fix out of the notes. Start each with a past-tense verb (Added, Changed, Fixed, Removed, Updated), end it with a period, and leave out CI, tooling, test, formatting, and refactoring changes. Earlier releases read like this:

```markdown
- Added notice to finished game if its settings differ from your own settings.
- Fixed regression of version 1.1.7 and restored browser support of older iOS versions.
```

Output the version, the commit list, and the release notes as text. Then use `AskUserQuestion` to ask for approval of the version and notes, offering to release with them or to end the release here. When the answer carries corrections, apply them and ask again. Approval covers every push and the release publish in Steps 3 to 5, so run those steps without asking again.

Write the approved notes to `.turbo/release/<version>-notes.md`.

## Step 3: Bump and Deploy

When `package.json` already carries the version, mark this step's task completed and continue at Step 4, tagging the current `main` head, whose CI run Step 1 confirmed deployed.

Otherwise set `version` in `package.json` to the new version, then commit and push:

```bash
git add package.json
git commit -m "Updated version"
git push origin main
```

**When the push is rejected**, output the rejection message as text. Then use `AskUserQuestion` to offer retrying the push once the user has resolved the cause, or ending the release here.

Find the CI run for that commit with `gh run list --workflow CI --branch main --event push --commit "$(git rev-parse main)" --limit 1 --json databaseId,status`, listing again when it is not there yet, then wait for it via the Bash tool (`timeout: 600000`): `gh run watch <run-id> --exit-status --interval 30`. When the call is backgrounded before the run ends, wait for its completion notice.

**When the run fails**, read the failing job and step from `gh run view <run-id> --json jobs` and output them as text. The version commit is already on `main` and the site still serves the previous deploy. Use `AskUserQuestion` to offer:

- **Re-run the failed jobs** — for a failure unrelated to the code, such as a runner or network problem: `gh run rerun <run-id> --failed`, then wait for the run again
- **Fix and retry** — commit the fix on `main`, push it, and wait for that commit's CI run; tag the fix commit in Step 4
- **End here** — leave the version commit untagged; the next release attempt resumes from Step 1

## Step 4: Tag

Tag the deployed commit with an empty message and push the tag:

```bash
git tag -s <version> -m "" main
git push origin <version>
```

## Step 5: Publish the GitHub Release

Create the release without a title, so GitHub shows the tag name as earlier releases do:

```bash
gh release create <version> --verify-tag --notes-file .turbo/release/<version>-notes.md
```

Confirm the result with `gh release view <version> --json isDraft,url,tagName`.

## Step 6: Report

State the version, the release URL, and that CI deployed the tagged commit to https://shitishot.de.

Then use the TaskList tool and proceed to any remaining task.
