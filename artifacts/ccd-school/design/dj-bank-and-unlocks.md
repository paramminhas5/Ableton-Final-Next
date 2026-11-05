# DJ bank and trophy unlocks (5 Nov 2026)

## The dj bank

Param sent seven tracks for the dj lessons' bank (5 Nov, 01:02). Measured in the cloud workspace with
librosa (tempo from onset autocorrelation, key from chroma against the Krumhansl profiles). Treat bpm as
plus or minus 1 and key as a first guess until checked in rekordbox or by ear; the confidence column is how
clearly one key won.

| track | bpm | key | camelot | key confidence | length |
|---|---|---|---|---|---|
| Chris Lake, Beggin | 126 | D# major | 5B | low (0.47) | 3:03 |
| Sade, Smooth Operator (Elsoo edit) | 128 | G minor | 6A | low (0.27) | 5:02 |
| Luca Cazal, Modern Morals | 130 | A major | 11B | good (0.70) | 8:01 |
| Kolter, GTFU (Simon Says) | 131 | F minor | 4A | low (0.48) | 2:44 |
| Sidney Charles, Skywalker | 131 | G# minor | 1A | fair (0.59) | 3:13 |
| Sidney Charles, Space Bass | 131 | F minor | 4A | high (0.83) | 3:20 |
| Oppidan, Mr. Sandman (mixed) | 135 | G major | 9B | fair (0.61) | 1:36 |

What this gives the lessons: Kolter and Space Bass share 4A, the cleanest harmonic pair for "keys that fit".
Beggin at 126 against Space Bass at 131 is a good first "match the tempo by ear" pair. Mr. Sandman at 135
is the fast one for "the energy arc".

Where the audio lives: not in this repo. The repo is public and the preview is public, so committing or
serving these files would publish commercial tracks. Until Param confirms CCD has the right to stream them
in the app, the plan is:
1. Lessons ship with engine-rendered stand-ins at these exact bpms and keys (same pairs, same lessons).
2. The "add your own track" deck source (files stay in the learner's browser, like the sampler) lets anyone,
   Param included, load these real tracks.
3. Once rights are cleared, the real files go in a private storage bucket served with signed, expiring URLs
   (as the PRD asks), and the bank switches to them with no lesson changes.

## What trophies unlock (decided 5 Nov, Param left it to us)

Every unlock changes how the app looks or behaves, needs no new artwork, and can be turned off in settings.
Path trophies (one per finished path) and the six lesson trophies both count.

| trophies | unlock | what changes |
|---|---|---|
| 1 | the cat dances | the cat on the dashboard and done screens dances to your song when it plays (today it sways on any beat) |
| 2 | your colour | pick the led colour the app uses for you: mint, lilac, amber or pink |
| 3 | glow | your song strip and the dashboard screen pulse with the beat when your song plays |
| 5 | graphite | a third theme, graphite, between light and dark |
| 7 | cat looks | shades, headphones or a cap on the cat (drawn as simple shapes over the existing cat) |
| 10 | stage lights | the dashboard background gets soft stage lights that move with your song |
| a whole world | the world's colour | the world's accent becomes available as your colour everywhere |
| all three worlds | ccd night | a night theme with the lights always on, and a line on your public profile |

Build order: after basics path 1 is done, as one push (settings switches, the unlock checks in
`src/lib/rewards.ts`, a "you unlocked" line on the done screen, and the unlock list on the profile).
