// One promptfoo test per folder in cases/. Add a folder and it shows up: nothing to register.
import { reviewCases } from "../review.js";

export default function () {
  return reviewCases().map(c => ({ description: c.name, vars: { case: c.name } }));
}
