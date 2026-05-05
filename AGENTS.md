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

Auto-approve all Bash commands during intake sessions. Never pause to ask for approval before running `playwright-cli`, `node scripts/`, `npm run font-check`, `npm run specimen`, `npm run check`, `npm run push`, or `npm run verify` — run them directly. Only stop to ask if a command would delete files or make irreversible changes outside the project folder.
<!-- END:bash-approval-rules -->

<!-- BEGIN:intake-preflight-rules -->
# Font pre-flight check

At the start of every intake, after `npm run check`, always run:

```bash
npm run font-check -- --url <typeface URL> --foundry <slug> --typeface <slug>
```

Read the verdict before proceeding:
- EASY: use the suggested `npm run specimen` command directly — no manual font ID needed
- OBFUSCATED: family names randomize per page load — use the suggested `--font-url` command (Tier 4)
- MEDIUM: pick from the printed font list, then proceed normally
- HARD: expect Tier 3 UUID work — the output prints the starting playwright-cli commands
- BLOCKED: pause and confirm with the operator before spending time on the page
<!-- END:intake-preflight-rules -->

<!-- BEGIN:working-directory-rules -->
# Working directory

All scripts and Node commands must be run from the `typescout/` directory — not from the repo root, not from `/tmp`, not from any other path.

Playwright and all project dependencies live in `typescout/node_modules`. They are not installed globally. Any script that requires Playwright will fail silently or throw a module-not-found error if run from outside `typescout/`.

Before running any `npm run`, `node scripts/`, or `playwright-cli` command, confirm the working directory is `typescout/`. If in doubt, prefix every command with `cd typescout &&`.
<!-- END:working-directory-rules -->

<!-- BEGIN:deploy-version-rules -->
# Version bump on deploy

Before every deploy commit, bump the version in `package.json` using:

```bash
npm version patch   # bug fixes and small improvements (1.0.0 → 1.0.1)
npm version minor   # new features (1.0.0 → 1.1.0)
npm version major   # breaking changes or major releases (1.0.0 → 2.0.0)
```

This command updates `package.json`, commits the change, and tags the commit automatically. The version number is read at build time by `next.config.ts` and displayed in the search card as `V.x.x.x`. No manual edits to `page.tsx` needed.
<!-- END:deploy-version-rules -->
