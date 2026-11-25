---
name: make-release
description: Cut a release of this package. Use when the user asks to release, publish or tag a new version.
---
1. Read the full commit messages since the last tag, titles and bodies: `git log <last-tag>..HEAD --format=%B`.
2. Run `npm test`. If it is red, stop and report. Do not bump, tag or push anything.
3. Load `semver-rules` and choose the next version. Load `changelog-style` and write the entry.
4. `node bump.mjs <version> "<entry>"`, then commit as `release: v<version>`.
5. `git tag v<version>`, then `git push origin main --tags`.
6. `gh release create v<version> --notes "<entry>"`.
