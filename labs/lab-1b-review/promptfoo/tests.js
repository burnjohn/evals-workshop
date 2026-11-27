// One promptfoo test per folder in cases/. Add a case and it shows up here: nothing to register.
import { reviewCases } from "../../../lib/review.js";

export default function () {
  return reviewCases()
    .filter(c => Array.isArray(c.defects))            // a case still marked TODO is not labelled yet
    .map(c => ({
      description: `${c.name} (${c.source})`,
      vars: { case: c.name },
      metadata: { source: c.source },
    }));
}
