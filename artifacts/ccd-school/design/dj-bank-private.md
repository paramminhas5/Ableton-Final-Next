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

1. Run `python3 -I scripts/bank/chop.py <folder of the files> <a folder outside the repo>`. It writes `full.ogg` and one 16-bar chop per cue for each track. The script refuses to write inside the repo, and `private-bank/` is ignored.
2. Upload that folder to a private bucket that serves through signed or logged-in URLs.
3. Set `NEXT_PUBLIC_CCD_BANK_URL` to the bucket's base url on the deployment. Deck b then loads the real track, at its measured bpm, through the file deck.

Steps 2 and 3 are Param's to do. They are an environment key and a storage decision, and they need CCD to have the rights to stream these tracks to learners. They are released commercial tracks, so playing them inside a public app is different from playing them in a club set.
