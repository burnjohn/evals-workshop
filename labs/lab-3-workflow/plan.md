# Plan: display name
Status: approved · Spec: spec.md

## T1: profile API
- Serves: AC-1 · Type: backend · Model: haiku · Depends-on: none
- Skills to use: api-rules
- Owned paths: api/profile.js

## T2: profile page
- Serves: AC-2 · Type: ui · Model: haiku · Depends-on: none
- Skills to use: ui-rules
- Owned paths: web/profile.js

## T3: audit log
- Serves: AC-3 · Type: backend · Model: haiku · Depends-on: T1
- Skills to use: api-rules, db-rules
- Owned paths: api/audit.js

## After the tasks, one at a time
code-review, test-writer, qa, make-release. Nothing is skipped. If qa fails, there is no release.
