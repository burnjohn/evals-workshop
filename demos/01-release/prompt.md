# Demo 1 · make-release: add a regression case

## Prompt

```text
Add a release regression case starting at v1.4.2.
The first commit renames a public response field and documents the
breaking change in its body. A feature and a docs-only commit follow.
Use the existing case format, real file changes in each commit, and the id breaking-then-docs.
Derive the expected result from semver-rules.
Leave the release skill and existing cases unchanged.
```

## Start state

`npm run step lab-1a`. The cases are in `labs/lab-1a-release/cases.json`: the commits, and `expect`, the answer key.

## Check

```bash
npm test -- lab-1a
```

Read the new entry's `expect` yourself. It must follow from `semver-rules`: a breaking change anywhere in the set gives a major bump, whatever the order of the commits. Expected here: `2.0.0`, published. The run is live: Claude Code cuts the release in a throwaway repo, and the checks read the remote.

Then break the skill: in `plugin/skills/make-release/SKILL.md`, delete step 5 (tag and push), and run it again. Every case that should publish goes red. The finished state is `npm run step lab-1a-done`.

## Try it yourself

Add a case where the breaking commit comes last and the tests are red. Decide the expected result before you run anything.
