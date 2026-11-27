---
name: ui-rules
description: House rules for UI code in web/. Use when you write or change a page, a component or a control.
---
# UI house rules

- Every `<button>` has a `data-track` attribute: a snake_case event name, page first, for example `settings_save`.
- Escape every value that comes from a user before it goes into HTML.
- Reuse the helpers the page already imports. Don't write a second version of one.
- Labels are sentence case: "Dark mode", not "Dark Mode".
