# Consolidation: where everything lives (4 Nov 2026)

## Code
- **main = school/field** as of 4 Nov (b0cec4b), plus the work since on school/field. Production (learn.catscandance.com) still serves an older build. Nothing merged to main or moved without Param's say.
- **school/final** held the lesson content (116 deep lessons, batches 1 to 6) and the roles work. school/field branched from it at 328b1f9. The one later commit (eb5a8ad, roles and Members admin) is now on school/field.
- **46 older branches** (May to June 2026: duolingo-rebuild, world-class-upgrade, ui/world-class-redesign, feat/*, fix/*, spec/*, phase-*). All were folded into main or superseded. Nothing on them is needed. Proposal for Param to approve: tag each head as `archive/<name>` so it can never be lost, then delete the branches. Not done.
- **Old UI (brutal look, old lesson player, snake path map):** preserved on `school/final` and `archive/pre-cleanup-2026-10-30`. The settings screen links to school/final as the "old version". A hosted preview of it is a to-do for Param (Vercel preview of school/final).

## Docs (project folder ccd/)
- Product: school-readme.md (the brief), school-prd.md, school-instrument-plan.md, engine-sound.md.
- Design: school-redesign.md (Model 1 look pass log), school-learning-plan.md (4 Nov learning rebuild), school-pro.md (proposal, no reaction yet).
- Content: school-content-handoff.md, school-voice.md (voice guide), lesson-format (repo design/lesson-format.md).
- History: history.md, archive/ (old changelogs, batch notes, test report, live-link plan).

## Content
- 171 lessons in src/content: 116 deep, 55 short. New lessons are YAML files in src/content/lessons/<world>/ (see lesson-format.md).
- Hard-mode quiz banks live in the unused lesson-deep*.ts files (40 DJ, 52 foundations, 18 synths, 55 Ableton). They feed the new "hard" level.
- Ideas from the earlier R&D that are folded into the plan: five-loop pedagogy (ear, hands, copy, finish, scene), project-based learning, ear training with feedback, AI as coach not composer, finished pieces per learner per month as the north star.

## To tell Param
- Approve the archive-tag then delete of the 46 branches.
- Deploy a preview of school/final and give the URL for the "old version" link.
