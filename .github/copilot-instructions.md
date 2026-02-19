# Repo instructions (Warhammer40kcrusadeAI)

- Objective: improve repo hardening and CI reliability with minimal changes.
- Do NOT change application logic unless explicitly requested.
- Prefer small, mechanical PRs (one topic per PR).
- If you touch workflows:
  - Use least-privilege `permissions:`.
  - Do NOT add expensive jobs to every PR; prefer scheduled runs.
  - Never create automations that trigger on Dependabot PRs.
- Package manager: pnpm. Keep lockfile changes minimal and justified.
- After changes, ensure CI passes.
