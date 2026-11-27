# Spec: display name
- AC-1 `GET /profile` returns `displayName`.
- AC-2 The profile page shows `displayName`.
- AC-3 `logChange(id, oldName, newName)` in `api/audit.js` appends `{ id, oldName, newName, at }` to the audit log and returns it.
