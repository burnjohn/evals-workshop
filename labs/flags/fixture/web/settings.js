// The settings page. flags: the values from flags.json, passed in by web/app.js.
import { button, esc } from "./ui.js";

export function renderSettings(user, flags = {}) {
  return [
    `<h1>Settings</h1>`,
    `<label>Name <input name="name" value="${esc(user.name)}"></label>`,
    button("Save", "settings_save"),
  ].join("\n");
}
