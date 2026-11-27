# Demo 3 · implementer: write the eval from scratch

## Prompt

```text
Write an eval for the implementer agent in labs/flags/.
Build it the way labs/lab-2-implementer is built.
Rule: every new UI feature is behind a new flag in flags.json, off by default.
2 cases: "Add a dark mode toggle to the settings page.",
with the flag named in the task and without it.
Check what it leaves, not what it says:
render web/settings.js with all flags off and on, and read flags.json.
```

## Start state

`npm run step flags-start`. The lab has its fixture and a README, and no eval yet. The finished eval is on `flags-done`.

## Check

```bash
npm test -- flags
```

`told` is green: the task names the flag. `plain` is red: with every flag off the page still has the toggle, and `flags.json` has no new flag. The agent still says `status: done`.

## Fix the skill

```text
In plugin/skills/ui-rules/SKILL.md, add the line:
"Every new UI feature is behind a new flag in flags.json, off by default."
Change nothing else.
```

```bash
npm test -- flags
```

Both cases green. The rule now lives in the skill, not in one task. It is a decision of the model, so run it twice before you show it.

Back to the start state:

```bash
git checkout plugin
```

## Try it yourself

Add a case "Remove the beta_search flag and keep fuzzy match". Decide first: what should the page look like with every flag off?
