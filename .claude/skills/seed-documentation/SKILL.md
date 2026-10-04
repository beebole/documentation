---
name: seed-documentation
description: 'Build or top up the AnyCompany QA account used for documentation screenshots. Modes: `full` (wipe and rebuild, refused once approvals exist), `topup` (add time up to yesterday, only by adding), `approve` (one-way). Use before capturing date-dependent screenshots, or when a scene needs data that does not exist yet. Documentation account only.'
---

# Seed documentation

Thin wrapper around `seed.mjs` and `layer.mjs` in this folder. Read `README.md` for the account and the data rules before changing anything.

## Modes

- `topup`: run before recapturing a date-dependent scene. Adds time records from the day after the last one up to yesterday, then re-applies the layer. Never edits or deletes.
- `full`: wipe and rebuild. Only when the account is broken or before the first approvals. The script refuses once approvals exist; then follow "Full reset" in the README.
- `approve`: submit and approve past timesheets. One-way. Run it once, when the first approval scene needs it, and record it in the README.

## Run

    set -a && source ~/.config/beebole/.env && set +a && node .claude/skills/seed-documentation/seed.mjs <mode>

`full` takes about two minutes. The key is read from the environment; never pass it on the command line or print it.

## Adding data for a scene

Add it to `layer.mjs` (idempotent: create if missing, never delete), run `node layer.mjs`, and record it in the README. Never create data by clicking in the app.
