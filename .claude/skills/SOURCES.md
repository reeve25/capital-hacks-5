# Skill sources

Copied unmodified from github.com/23jmo/jmo-skills at commit `6082bf2c4728`. Disclose these in the presentation with other AI tools and open-source use.

- `interview`, `ste`, `codex`: Johnathan Mo, MIT (`LICENSE-jmo-skills`).
- `better-ui`: Jakub Krehel, MIT (`better-ui/LICENSE`).
- `animate`: Emil Kowalski, MIT (`animate/LICENSE`).

Not installed: `agentation` (PolyForm Shield 1.0.0, Next.js only, unpinned `npx`), Supabase, Neon and Stripe MCP connections.

`impeccable` (v4.8.0): Paul Bakaus, Apache 2.0 (`impeccable/LICENSE`, `impeccable/NOTICE.md`), from github.com/pbakaus/impeccable at commit `687bc38`, added Sat Nov 7 at Nathan's request. `SKILL.md` and `reference/` were copied first. Sat Nov 7 afternoon, at Nathan's request, the launcher was added from the same commit: `scripts/impeccable`, `impeccable.cmd`, `VERSION` (engine 0.1.18), `engine-checksums.txt`, `command-metadata.json` and `data/` (font index). The launcher was read before use. On first run it downloads the prebuilt engine binary from the project's GitHub releases into `~/.impeccable/bin/0.1.18/` (outside the repo) and refuses it unless its SHA-256 matches `engine-checksums.txt`; the Windows binary matched (`8f61e96b...395d9f`). The binary itself is closed to reading and runs unsandboxed with the agent's environment. `scripts/bin/` is ignored, so no binary enters git. Still left out: the `live-browser*.js` and `modern-screenshot` files, because `live` mode can start an agent with approvals off. The design-detector hook is wired only on Nathan's laptop, in the ignored `.claude/settings.local.json`; it is not in shared settings.
