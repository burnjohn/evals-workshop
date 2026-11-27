// Builds the prompt for one version of the code-review skill: promptfooconfig.yaml says which file
// (prompts[].config.skill, a path from the repo root; null = no skill). The same prompt review.test.js sends.
// promptfoo renders prompts as Nunjucks templates; JSX like style={{ … }} would break that, so the text is wrapped in {% raw %}.
import { reviewCases, reviewPrompt } from "../../../lib/review.js";

export default function ({ vars, config }) {
  return `{% raw %}${reviewPrompt(config.skill, reviewCases().find(c => c.name === vars.case))}{% endraw %}`;
}
