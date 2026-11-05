# Sound shootout scripts

How `design/sound-shootout.md` was measured. Our side renders natively (`cargo run --release --bin shootout -- <dir>`
in `engine/`); their side is rendered by `theirs.py` with init-style patches written here, through Spotify's
pedalboard (VST3) and `lv2host/host.c` (a tiny LV2 host for Geonkick). `measure.py` measures both sides with
the same code. The plugins themselves are downloaded and built outside the repo (set `SHOOTOUT` to that folder);
no plugin code is in this repo.
