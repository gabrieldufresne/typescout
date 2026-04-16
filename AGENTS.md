<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:design-system-rules -->
# Design system

For any frontend or component work, read `DESIGN.md` at the project root before writing or modifying any code. It contains the canonical color tokens, type scale, card dimensions, motion rules, and a list of banned patterns. Do not introduce any color, font, radius, or shadow not defined there.
<!-- END:design-system-rules -->

<!-- BEGIN:bash-approval-rules -->
# Bash approval

Auto-approve all Bash commands during intake sessions. Never pause to ask for approval before running `playwright-cli`, `node scripts/`, or `npm run` commands — run them directly. Only stop to ask if a command would delete files or make irreversible changes outside the project folder.
<!-- END:bash-approval-rules -->

<!-- BEGIN:working-directory-rules -->
# Working directory

All scripts and Node commands must be run from the `typescout/` directory — not from the repo root, not from `/tmp`, not from any other path.

Playwright and all project dependencies live in `typescout/node_modules`. They are not installed globally. Any script that requires Playwright will fail silently or throw a module-not-found error if run from outside `typescout/`.

Before running any `npm run`, `node scripts/`, or `playwright-cli` command, confirm the working directory is `typescout/`. If in doubt, prefix every command with `cd typescout &&`.
<!-- END:working-directory-rules -->
