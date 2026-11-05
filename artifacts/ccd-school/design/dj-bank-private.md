# The dj bank: Param's picks, privately

On 5 Nov 2026, Param uploaded 13 tracks and asked for them to be saved and used in the lessons, as whole tracks or as parts and chops, with similar songs used first.

## What is in the repo

Only numbers, in `src/content/djTracks.ts`: bpm (from a comb fit on the onsets), key and Camelot code (from chroma matched against the Krumhansl profiles, with the match confidence kept), length in bars, and cues at intro, drums in, break and drop (from the low-band energy in each block of eight bars, so they're approximate).

| track | bpm | key | camelot |
|---|---|---|---|
| aat, like this | 127 | g# minor | 1A |
| aline umber, les mecs en chemise (radio edit) | 128 | g minor | 6A |
| barry can't swim, kimpton | 122 | e minor | 9A |
| barry can't swim, sonder | 128 | f minor | 4A |
| barry can't swim, all my friends | 120 | c# major | 3B |
| caribou, odessa | 118 | f minor | 4A |
| chez damier, can you feel it (mk new york dub extended) | 124 | a# minor | 3A |
| dj atlance, liquid sunshine | 127 | f major | 7B |
| franky rizardo, baile de fantome | 128 | c# minor | 12A |
| mf doom, doomsday | 95.4 | f# major | 2B |
| sidney charles, disco bumpin | 130 | f# minor | 11A |
| cap | 130 | f# minor | 11A |
| mainline magic orchestra, xumba xumba (eden burns remix) | 126 | g major | 9B |

The keys are machine estimates. Before a lesson leans on one, check it by ear or against rekordbox's analysis.

## How lessons use them now

- Deck b offers the bank sorted to suit your song: Param's picks first, then the nearest tempo, then a key that mixes.
- A lesson that names a stand-in gets the closest real pick instead, when one is within 2 bpm and its key mixes. For example, "smooth" (128, 6A) becomes aline umber's track.
- Until the audio is cleared, deck b plays our engine at the pick's tempo and key, and says so on the deck ("barry can't swim, our engine at its tempo and key").

## Turning on the real audio

The private bucket exists: `dj-bank` in the ccd-school Supabase project (not public, 50 MB a file, audio types only). The app asks `/api/bank/<track id>/<file>` for a track; the route checks the learner is signed in and redirects to a signed link that works for ten minutes. Signed out, or with the bank off, it answers 401 or 503 and deck b plays our engine at the track's tempo and key, as before.

1. Run `python3 -I scripts/bank/chop.py <folder of the files> <a folder outside the repo>`. It writes `full.ogg` and one 16-bar chop per cue (`intro.ogg`, `drums-in.ogg`, `break.ogg`, `drop.ogg`) for each track. The script refuses to write inside the repo, and `private-bank/` is ignored.
2. Upload it: `CCD_BANK_SERVICE_KEY=<service role key> node scripts/bank/upload.mjs <that folder>`. The key is in Supabase, ccd-school, project settings, api keys.
3. Add `CCD_BANK_SERVICE_KEY` (the same service role key) to the Vercel project's environment. It is server-only; never put it in a `NEXT_PUBLIC_` variable.

Steps 2 and 3 need the service role key, so they are Param's to do. Param confirmed on 5 Nov that the tracks live privately; streaming them also needs CCD to have the rights to stream these tracks to learners. They are released commercial tracks, so playing them inside a public app is different from playing them in a club set.
