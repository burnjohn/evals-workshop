---
name: semver-rules
description: Choose the next version number from a list of commits. Use before any version bump.
---
- `BREAKING CHANGE` anywhere in a message, or `!` after the type: major.
- `feat`: minor. Anything else: patch.
- The highest rule wins. The title alone is never enough.
