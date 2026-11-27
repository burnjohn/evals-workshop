// The prompt for one column (config.column: base | pr | none) and one case. Wrapped in {% raw %} because
// promptfoo renders prompts as Nunjucks, and JSX like style={{ … }} or ${…} would break that.
import { caseNamed, reviewPrompt } from "../review.js";

export default function ({ vars, config }) {
  return `{% raw %}${reviewPrompt(config.column, caseNamed(vars.case))}{% endraw %}`;
}
