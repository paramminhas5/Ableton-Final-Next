# CCD School design

- `model1/screens/` – a picture of every final screen (phone 390×844, tablet 1180×820). Start here.
- `model1/boards/` – the same screens as HTML boards from the design canvas. Images point at canvas blobs, so open the screenshots for the full look.
- `model1/generators/` – the Python that generated the boards. `gen_final.py` builds the final set; the numbered `gen_m*.py` files are the rounds it builds on. Running `python3 gen_final.py` writes boards to `generators/project/`; `node shot_opts.js <board>` screenshots one.
- `instrument-plan.md` – what has to be built so every control works: one Rust engine, iOS, Android, web, Ableton Live.
- `next-chat-prompt.md` – the prompt to start the build.
- `redesign-notes.md` – every design decision, round by round.

Live design canvas: https://claude.ai/code/artifact/36c4ce2a-9660-4375-a101-a41ac0edc49a (page "Model 1 · final").
