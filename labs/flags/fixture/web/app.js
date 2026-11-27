// Renders the pages with the flags from flags.json.
import { readFileSync } from "node:fs";
import { searchBox } from "./search.js";
import { renderSettings } from "./settings.js";

const flags = JSON.parse(readFileSync(new URL("../flags.json", import.meta.url), "utf8"));
export const pages = {
  search: q => searchBox(q, flags),
  settings: user => renderSettings(user, flags),
};
