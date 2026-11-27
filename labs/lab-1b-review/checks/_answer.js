// Shared by the checks: read the model's answer and find the case it answered.
import { findings, reviewCases } from "../../../lib/review.js";
export { findings };
export const caseOf = context => reviewCases().find(c => c.name === context.vars.case);
