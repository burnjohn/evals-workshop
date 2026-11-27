// The search box. flags: the values from flags.json, passed in by web/app.js.
import { button, esc } from "./ui.js";

export function searchBox(query, flags = {}) {
  const parts = [`<input name="q" value="${esc(query)}">`, button("Search", "search_submit")];
  if (flags.beta_search) parts.push(`<label><input type="checkbox" name="fuzzy"> Fuzzy match</label>`);
  return parts.join("\n");
}
