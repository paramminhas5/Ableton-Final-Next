# The improvement loop

A scheduled task runs this loop in its own session, five rounds in all, on branch `school/field`. Each round builds, has the app reviewed by a fresh pair of eyes, fixes what matters most, suggests the next improvements in visuals and product, and leaves notes for the next round. Param asked for it on 5 Nov 2026 (03:43).

## Each round

1. **Read first.** This file, `learnings.md` (what earlier rounds found and decided), `state.md` (which round this is), `design/engine-plan.md`, `ccd/school-fixes.md` in the project, and the last 20 commits on `school/field`.
2. **Stop checks.** If `state.md` says five rounds are done, turn this scheduled task off (find it with `list_triggers` by its name, "CCD School improvement loop", then `update_trigger` with `enabled: false`; a round cannot delete its own task), write one line in `learnings.md`, and stop. If a tool or message says the account is near its usage limit, stop, write a line saying so, and leave the round unfinished rather than half-pushed.
3. **Build and test.** From `artifacts/ccd-school`: `npm install --legacy-peer-deps` if needed, `npm run lessons`, `npx tsc --noEmit -p .`, `npx vitest run`, `cd ../../engine && cargo test --release`, then `npx next build` and `npx next start -p 3100` (in the background). Walk the app: `ALL=1 node scripts/shots/walk-all.mjs http://localhost:3100 chromium 1440 900`, the same with `webkit 390 844`, `BASE=http://localhost:3100 node scripts/shots/mix-smoke.mjs <dir>`, `node scripts/shots/sound.mjs http://localhost:3100 <dir>`. Fix anything red before anything else.
4. **Fresh review.** Spawn a reviewer agent that has not seen the work. It walks the screens at 390x844 and 1440x900, light and dark, looks at the screenshots, and returns a ranked list of fixes, bugs with repro steps, and bigger product ideas. Give it the house rules below. Do not let it edit files.
5. **Fix.** Take the top items that are fixable in this round, in order of what a learner feels most. Each fix keeps every test green. Every engine change gets a measured test in `engine/tests/sound.rs` and a fresh `/sound` after clip (`cargo run --release --bin ab_clips -- ../artifacts/ccd-school/public/audio/ab/after`, then convert to flac).
6. **Engine 2.** If the round has room, take the next item from `design/engine-plan.md` in its order (items 5 onward), the same way.
7. **Suggest.** Write the round's suggestions for visuals and product into `learnings.md`, ranked, with why. Mark which ones you built.
8. **Ship and record.** Commit and push to `school/field` (fetch, `rebase --autostash`, push). Update `ccd/history.md` (one dated line), `ccd/school-fixes.md` (numbered items), and `ccd/school-readme.md` status in the project when something changed. Add the round's lessons to `learnings.md`: what worked, what broke, what to do differently. Bump `state.md`.

## House rules (never break these)

- Never merge to `main`, change production settings, the domain, environment keys, or anything that costs money. Those are Param's calls.
- Never commit or serve Param's seven dj tracks; only their bpm and key are stored.
- Lowercase UI, no em dashes anywhere, one pink go button per screen, every lesson acts on the learner's song.
- Never claim a sound matches Ableton or any product without Param's ear test.
- Keep tsc, vitest, cargo test and next build passing. Run `npm run lessons` before `next build`.
- Never `pkill -f` a pattern that appears in your own command; stop servers with `fuser -k PORT/tcp`. Use `waitUntil: "load"`, never `"networkidle"`.
- Render touched screens at 390x844 and 1440x900, light and dark, Chromium and WebKit, and look at them.
- Commit messages end with the attribution lines the session tells you to use.
