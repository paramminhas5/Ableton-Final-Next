import type { LessonScreen } from "./types";
import { FLAGSHIP_BATCH_2A } from "./flagship-batch-2a";
import { FLAGSHIP_BATCH_3A } from "./flagship-batch-3a";
import { FLAGSHIP_BATCH_3B } from "./flagship-batch-3b";
import { FLAGSHIP_BATCH_2B } from "./flagship-batch-2b";

/**
 * Deep versions of the flagship lessons. They replace the short flow for these slugs.
 * Shape of every lesson: a problem you can picture, the idea, a thing to move, decisions
 * with a reason behind each wrong answer, the exact settings, a mistake check, one question
 * recycled from an earlier lesson, a summary. The Do it in Live task follows the summary.
 */
const FLAGSHIP_BATCH_1: Record<string, LessonScreen[]> = {
  sidechain: [
    { kind: "hook", emoji: "🥁", headline: "Your kick keeps vanishing", subtext: "Kick and bass fight for the same low end. Sidechain settles it." },
    { kind: "concept", title: "Why the kick disappears", body: "Kick and bass both live under about 150 Hz. When they hit together, the louder wave swallows the other and the kick loses its punch, even if both faders look fine.", keyFact: "Two loud sounds in the same low notes cancel each other's punch.", visual: "frequency-bar" },
    { kind: "interact", sim: "sidechain", prompt: "Switch the sidechain on and off. Hear the pad move." },
    { kind: "concept", title: "The trick", body: "Put a Compressor on the bass, but let the kick trigger it instead of the bass itself. Every kick turns the bass down for a moment, then the bass comes back.", keyFact: "The compressor sits on the bass. The kick is only the trigger.", visual: "signal-chain", visualProps: { signalNodes: ["Kick", "Compressor on bass", "Master"] } },
    { kind: "quiz", q: "You put a Compressor on the kick track and choose the kick as its sidechain source. What happens?", options: ["The bass ducks under the kick", "The kick compresses itself and the bass is untouched", "The kick gets quieter whenever the bass plays", "Nothing, Live blocks it"], answer: 1, explain: "The compressor only changes the track it sits on. Sidechaining a track to itself is just normal compression. To duck the bass, the compressor must be on the bass.", hint: "Which track does a compressor change?" },
    { kind: "concept", title: "Setting it up in Live", body: "On the bass track, add Compressor. Click the small triangle at the top left to open the Sidechain section, switch it on, and choose the kick track in Audio From.", keyFact: "Audio From: your kick track. Leave Listen off." },
    { kind: "sequence", prompt: "Put the setup in order", items: ["Add a Compressor to the bass track", "Open the Sidechain section", "Switch Sidechain on", "Choose the kick track in Audio From", "Lower Threshold until the meter moves on every kick"], explain: "The routing comes first, because without a source the threshold does nothing. Threshold is last because you tune it by watching the gain reduction meter." },
    { kind: "match", prompt: "What does each control change?", pairs: [{ left: "Threshold", right: "How loud the kick must be to trigger the duck" }, { left: "Ratio", right: "How far the bass is turned down" }, { left: "Attack", right: "How fast the duck starts" }, { left: "Release", right: "How fast the bass comes back" }] },
    { kind: "quiz", q: "The bass sounds choppy. It has not come back to full level before the next kick arrives. What do you change?", options: ["Shorter Release", "Longer Attack", "Higher Ratio", "Raise the bass fader"], answer: 0, explain: "A short release lets the bass recover quicker. A longer release keeps it ducked, which is what you hear as choppy at fast tempos.", hint: "Which control sets the recovery?" },
    { kind: "quiz", q: "You play the track and hear the kick but not the bass. What did you most likely leave on?", options: ["Listen in the sidechain section", "Peak mode", "The Ratio", "Auto Release"], answer: 0, explain: "Listen plays the trigger signal instead of your track so you can check what the compressor hears. Switch it off once you have checked." },
    { kind: "quiz", q: "A house track needs a soft groove, not a heavy pump. Which is the better start?", options: ["About 3 to 6 dB of reduction with a release close to the beat", "As much reduction as the meter allows", "No attack and a very long release", "Ratio at its minimum and the threshold at the top"], answer: 0, explain: "A few dB, timed to the beat, gives movement without hollowing out the bass. Heavy ducking is a style choice for big pumping dance music.", hint: "Subtle groove means small reduction." },
    { kind: "quiz", q: "Earlier you met the Compressor. What does Ratio set?", options: ["How much the level is reduced once it passes the threshold", "How fast the compressor reacts", "How loud the output is", "Which track triggers it"], answer: 0, explain: "A higher ratio turns the signal down harder once it is over the threshold. Attack, release and output gain are separate controls." },
    { kind: "summary", learned: ["Compressor goes on the bass, the kick triggers it", "Audio From picks the trigger, Listen stays off", "Release sets how fast the bass comes back"] },
  ],

  compressor: [
    { kind: "hook", emoji: "🎚️", headline: "Louder parts, quieter parts, one balance", subtext: "A compressor turns down what is too loud so you can hear everything." },
    { kind: "concept", title: "The problem", body: "A bass line or vocal has loud notes and quiet notes. You turn it up so the quiet parts are heard and the loud parts jump out and clip or bury everything else.", keyFact: "Compression narrows the gap between loud and quiet.", visual: "amplitude-dial" },
    { kind: "interact", sim: "comp-lake", prompt: "Lower the threshold. Watch the peaks come down." },
    { kind: "concept", title: "Four controls do most of the work", body: "Threshold sets where it starts. Ratio sets how hard it pushes back. Attack and Release set how fast it grabs and lets go. Output gain brings the level back up afterwards.", keyFact: "Threshold: where. Ratio: how much. Attack and Release: when." },
    { kind: "match", prompt: "Match the control to the question it answers", pairs: [{ left: "Threshold", right: "How loud before it acts?" }, { left: "Ratio", right: "How hard does it turn things down?" }, { left: "Attack", right: "How quickly does it start?" }, { left: "Release", right: "How quickly does it let go?" }] },
    { kind: "quiz", q: "You want a snare to keep its crack. Which attack helps?", options: ["Slower, so the first hit passes before it clamps", "Fastest possible", "No attack control exists", "Attack does not affect the snare"], answer: 0, explain: "A slower attack lets the first part of the hit through, which is where the crack lives. A very fast attack squashes it and the snare sounds flat.", hint: "What is lost if the compressor grabs instantly?" },
    { kind: "quiz", q: "The meter shows 12 dB of gain reduction on a vocal and it sounds lifeless. What is the usual fix?", options: ["Raise the threshold or lower the ratio", "Lower the threshold more", "Turn Output down to zero", "Switch off the track"], answer: 0, explain: "Heavy reduction flattens the performance. Most vocals and basses sit around 3 to 6 dB of reduction on the loudest parts.", hint: "You want less reduction." },
    { kind: "concept", title: "Make-up gain, and the trap", body: "Compression lowers the level, so you raise Output to match what you had before. Louder always sounds better, so click the device on and off at the same loudness before you decide.", keyFact: "If you only like it louder, you do not like the compression." },
    { kind: "quiz", q: "You switch the compressor on and the track sounds better. What should you check before trusting that?", options: ["That the level with it on matches the level with it off", "That the knee is hard", "That Attack is at its minimum", "That Ratio is infinity"], answer: 0, explain: "Our ears hear louder as better. Match the level first, then compare the sound." },
    { kind: "quiz", q: "Which job suits a compressor with a medium attack, about 3 dB of reduction and a medium release?", options: ["Evening out a bass line", "Making a kick drum a sine wave", "Removing reverb tails", "Changing the pitch of a vocal"], answer: 0, explain: "Gentle, steady settings keep the level consistent without a sound of their own. That is the everyday use of a compressor." },
    { kind: "quiz", q: "From the sidechain lesson: which track does a sidechained Compressor sit on?", options: ["The track being turned down", "The track that triggers it", "The master", "A return"], answer: 0, explain: "The compressor changes the track it sits on. The sidechain only picks what makes it react." },
    { kind: "summary", learned: ["Threshold where, Ratio how much, timing when", "3 to 6 dB of reduction is a normal amount", "Match levels before judging the sound"] },
  ],

  "eq-eight": [
    { kind: "hook", emoji: "🔍", headline: "Find what is muddy, then cut it", subtext: "EQ is mostly taking things away." },
    { kind: "concept", title: "What an EQ really does", body: "It turns parts of the frequency range up or down. EQ Eight gives you eight bands on one curve, so you can shape the low end, the middle and the top of a sound in one place.", keyFact: "Low is rumble, middle is body and bite, high is air.", visual: "eq-curve" },
    { kind: "interact", sim: "device-lab", prompt: "Sweep a boost across the range. Hear what each area does." },
    { kind: "concept", title: "Where problems live", body: "Mud sits around 200 to 400 Hz. Harshness sits around 2 to 5 kHz. Rumble you cannot hear but your speakers feel sits under 30 Hz. Air sits above 10 kHz.", keyFact: "Cut mud, cut harshness, high-pass what does not need the low end." },
    { kind: "match", prompt: "Match the area to the problem", pairs: [{ left: "Under 30 Hz", right: "Rumble that eats headroom" }, { left: "200 to 400 Hz", right: "Mud" }, { left: "2 to 5 kHz", right: "Harshness" }, { left: "Above 10 kHz", right: "Air and shine" }] },
    { kind: "quiz", q: "A synth pad sounds dull and boxy. Which is the better first move?", options: ["Cut around 250 Hz with a medium-width band", "Boost everything above 10 kHz as high as it goes", "High-pass at 2 kHz", "Mute the track"], answer: 0, explain: "Boxiness is usually a build-up in the low mids. Cutting there often reveals brightness that was already in the sound, and cuts sound more natural than boosts.", hint: "Cut what is covering it before boosting." },
    { kind: "quiz", q: "Why do producers high-pass most non-bass tracks?", options: ["The low end they carry is inaudible and eats headroom", "It makes them louder", "It adds reverb", "It is required to save the Set"], answer: 0, explain: "Low-frequency energy you cannot hear still takes up headroom and muddies the mix. A low cut around 30 to 100 Hz on hats, vocals and pads clears it." },
    { kind: "concept", title: "How to find a problem", body: "Make a narrow boost, sweep it across the range while the track plays, and stop where the sound gets worst. Then flip that boost into a cut.", keyFact: "Boost, sweep, find it, then cut it." },
    { kind: "sequence", prompt: "Order the hunt for a harsh sound", items: ["Make a narrow boost", "Sweep it across the range", "Stop where it sounds worst", "Turn the boost into a cut"], explain: "You exaggerate first so the problem is easy to hear, then reverse it. Leaving the boost in would make it worse." },
    { kind: "quiz", q: "You cut 6 dB at 3 kHz on a vocal and it sounds thin. What now?", options: ["Reduce the cut or widen the Q", "Cut another 6 dB", "Add more reverb", "Boost 3 kHz on the master"], answer: 0, explain: "A deep, narrow cut can remove too much of the voice. Go gentler or wider, and compare with the device on and off at the same loudness." },
    { kind: "quiz", q: "From the compressor lesson: what should you check before trusting that an effect improved the sound?", options: ["That the loudness is matched with it on and off", "That Attack is fast", "That it is a stock device", "That the track is armed"], answer: 0, explain: "A louder sound seems better. The same applies to EQ boosts, which also raise the level." },
    { kind: "summary", learned: ["Cut mud and harshness before boosting anything", "High-pass tracks that do not need low end", "Boost, sweep, then cut to find a problem"] },
  ],

  "sends-returns": [
    { kind: "hook", emoji: "🌌", headline: "One reverb, ten tracks", subtext: "A shared space makes a mix sound like one room." },
    { kind: "concept", title: "The problem with reverb on every track", body: "A reverb on each track costs CPU and gives every sound its own room. The mix sounds like ten people in ten different places.", keyFact: "Shared effects make a shared space." },
    { kind: "interact", sim: "send-return", prompt: "Turn a send up. Hear that track move into the room." },
    { kind: "concept", title: "How it works", body: "A return track holds an effect. Every track has a Send knob that decides how much of its sound goes to the return. The dry sound stays on its own track.", keyFact: "Send amount is how much of the track goes to the effect.", visual: "signal-chain", visualProps: { signalNodes: ["Track", "Send knob", "Return with reverb", "Master"] } },
    { kind: "quiz", q: "You put Reverb on a return. What should its Dry/Wet be?", options: ["100 percent wet", "50 percent", "0 percent", "It does not matter"], answer: 0, explain: "The dry signal already plays on the original track. A return should carry only the effect, so the send knob controls the amount. Any dry signal on the return doubles up." },
    { kind: "sequence", prompt: "Build a reverb send", items: ["Insert a return track", "Drop Reverb on it", "Set Dry/Wet to 100 percent", "Turn up a Send on a track", "Adjust the amount while the track plays"], explain: "You build the shared effect first, then choose which tracks use it and how much." },
    { kind: "quiz", q: "Your kick gets lost in the reverb. What is the best fix?", options: ["Turn the kick's send down or off", "Turn the return's volume up", "Add another reverb to the kick", "Raise the kick fader"], answer: 0, explain: "Low, punchy sounds usually need little or no reverb. Each track controls its own amount through its send." },
    { kind: "concept", title: "Sculpt the return", body: "Because the reverb is on its own track, you can put an EQ after it. Cutting the low end of the reverb keeps the space clear and stops the mix getting muddy.", keyFact: "Put an EQ after the reverb, and cut its lows." },
    { kind: "quiz", q: "Why put an EQ after the reverb on the return?", options: ["To clear low frequencies from the effect only", "To make the reverb longer", "To change the dry signals", "To route sound to the master"], answer: 0, explain: "The EQ only touches the effect, not the original sound. That is something you cannot do when the reverb sits on each track." },
    { kind: "quiz", q: "From the EQ lesson: which part of the range is usually called mud?", options: ["About 200 to 400 Hz", "Under 30 Hz", "2 to 5 kHz", "Above 10 kHz"], answer: 0, explain: "Cuts in that area clean up a muddy sound, on a track or on the return." },
    { kind: "summary", learned: ["Returns share one effect across many tracks", "Return reverb stays 100 percent wet", "Each track's send sets how much it gets"] },
  ],

  "drum-rack": [
    { kind: "hook", emoji: "🥁", headline: "Sixteen sounds, one instrument", subtext: "A Drum Rack turns a folder of samples into a playable kit." },
    { kind: "concept", title: "What a Drum Rack is", body: "Each pad holds a sound and plays when its MIDI note arrives. A grid of pads gives you a kit, and the clip you write above it tells each pad when to fire.", keyFact: "One pad, one note, one sound." },
    { kind: "interact", sim: "beat-builder", prompt: "Build a four-on-the-floor pattern." },
    { kind: "concept", title: "Where notes go", body: "In the piano roll, each row is one pad. The default lower-left pad is the note C1, so kicks usually sit on the lowest row and hats a few rows above.", keyFact: "Rows are pads. Empty pads are silent." },
    { kind: "quiz", q: "You drew notes on a row but heard nothing. What is the most likely cause?", options: ["That pad has no sample in it", "The tempo is too high", "Warp is off", "The track is in Arrangement View"], answer: 0, explain: "Notes only trigger what the pad holds. An empty pad plays no sound, so check the pad before the notes." },
    { kind: "match", prompt: "Match the drum to its usual job", pairs: [{ left: "Kick", right: "The low pulse on the beat" }, { left: "Snare", right: "The backbeat on 2 and 4" }, { left: "Closed hat", right: "Steady subdivisions" }, { left: "Open hat", right: "Offbeat lift" }] },
    { kind: "quiz", q: "A closed hat and an open hat should not ring together. What setting solves this?", options: ["Put both pads in the same choke group", "Raise the open hat's volume", "Lower the tempo", "Turn on Warp"], answer: 0, explain: "A choke group cuts a sound when another pad in the group plays. That is how a closed hat stops an open hat, as on a real kit." },
    { kind: "sequence", prompt: "Make a basic beat", items: ["Load Drum Rack on a MIDI track", "Drop samples on the pads", "Insert a MIDI clip", "Draw kick, snare and hat notes", "Play it and adjust velocities"], explain: "The sounds come first because the notes are meaningless without them. Velocity comes last as a finishing touch." },
    { kind: "quiz", q: "Every hat hit sounds identical and robotic. What helps most?", options: ["Vary the velocity of the notes", "Speed up the tempo", "Delete half the hats", "Raise Master volume"], answer: 0, explain: "Real drummers never hit twice the same. Slight changes in velocity bring the pattern to life." },
    { kind: "quiz", q: "From the sends lesson: what should a reverb on a return track have for Dry/Wet?", options: ["100 percent wet", "0 percent", "50 percent", "Whatever you like"], answer: 0, explain: "The original track carries the dry sound, and the send sets how much goes into the effect." },
    { kind: "summary", learned: ["Each pad holds one sound and one note", "Choke groups cut open hats with closed hats", "Velocity changes make a beat feel played"] },
  ],

  "the-mixer": [
    { kind: "hook", emoji: "🎛️", headline: "Balance first, effects second", subtext: "Most of a good mix is faders and pan." },
    { kind: "concept", title: "What each track strip gives you", body: "Every track has a volume fader, a pan knob, mute and solo buttons, send knobs and a meter. These five handle most of the balance of a track.", keyFact: "Volume, pan, mute, solo, sends.", visual: "mixer-channel" },
    { kind: "interact", sim: "mixer", prompt: "Move the faders. Balance the kick, bass and pad." },
    { kind: "concept", title: "Headroom", body: "Loud peaks that reach 0 dB on the Master clip and distort. Keep peaks lower while mixing, around minus 6 dB, so the final stage has room to work.", keyFact: "Leave headroom. Make it loud at the end.", visual: "headroom-meter" },
    { kind: "quiz", q: "The Master meter is in the red and the sound crunches. Where do you start?", options: ["Turn the individual tracks down", "Turn the Master fader up", "Add a reverb", "Change the tempo"], answer: 0, explain: "The clipping comes from the sum of the tracks. Lower the tracks, ideally all together in a group, rather than fighting it at the end." },
    { kind: "quiz", q: "You are balancing a mix. Which order gives the best result?", options: ["Kick and bass first, then everything else around them", "Effects first", "Pan everything hard left and right", "Solo each track and set it as loud as it goes"], answer: 0, explain: "The low end carries the most energy, so it is set first. Other sounds are fitted around it, and judged together, not soloed." },
    { kind: "match", prompt: "Match the control to the job", pairs: [{ left: "Pan", right: "Left to right position" }, { left: "Solo", right: "Hear only this track" }, { left: "Send", right: "Amount going to a return" }, { left: "Fader", right: "Track level" }] },
    { kind: "quiz", q: "Why is a bass or a kick usually panned to the centre?", options: ["Low frequencies are loud and share power between speakers", "It makes them quieter", "Live does not allow panning bass", "It adds reverb"], answer: 0, explain: "Centre keeps low energy balanced across both speakers and on mono systems. Panning is used for sounds that need width." },
    { kind: "quiz", q: "From the EQ lesson: why high-pass tracks that carry no useful bass?", options: ["Inaudible lows eat headroom", "It makes them louder", "It adds reverb", "It speeds up the tempo"], answer: 0, explain: "Clearing low frequencies the listener cannot hear leaves more room for the kick and bass." },
    { kind: "summary", learned: ["Set kick and bass, then fit the rest around them", "Keep mix peaks around minus 6 dB", "Pan width, keep lows centred"] },
  ],

  tracks: [
    { kind: "hook", emoji: "🎼", headline: "Four kinds of track, four jobs", subtext: "Know which one you need before you add it." },
    { kind: "concept", title: "The kinds of track", body: "MIDI tracks hold notes that drive an instrument. Audio tracks hold recordings and samples. Return tracks hold shared effects. Group tracks bundle others so you can mix them together.", keyFact: "Notes, sound, shared effects, groups." },
    { kind: "match", prompt: "Which track for which job?", pairs: [{ left: "A synth bass line", right: "MIDI track" }, { left: "A vocal recording", right: "Audio track" }, { left: "One reverb for many tracks", right: "Return track" }, { left: "All the drums together", right: "Group track" }] },
    { kind: "interact", sim: "session-grid", prompt: "Launch clips on different tracks." },
    { kind: "quiz", q: "You drag a drum loop sample into Live. Which track does it land on?", options: ["An audio track", "A MIDI track", "A return track", "The master"], answer: 0, explain: "Samples and recordings are audio, and audio lives on audio tracks. A MIDI track needs an instrument to turn notes into sound." },
    { kind: "quiz", q: "You make a MIDI track and hear nothing when you play notes. What is missing?", options: ["An instrument on the track", "A return track", "An audio clip", "A group"], answer: 0, explain: "MIDI is only notes. It needs an instrument such as Wavetable, Drift or a Drum Rack to make sound." },
    { kind: "concept", title: "Name them as you go", body: "A Set with twelve tracks all called MIDI and Audio is slow to mix. Press Cmd or Ctrl R on a track title and name it by its job: Kick, Bass, Chords.", keyFact: "Name tracks by what they do, as you make them." },
    { kind: "quiz", q: "What is the quickest way to rename a track?", options: ["Select it and press Cmd/Ctrl + R", "Delete and remake it", "Rename the Set file", "Drag it to the master"], answer: 0, explain: "Cmd or Ctrl R renames whatever is selected. It is quick enough that there is no reason to leave tracks unnamed." },
    { kind: "quiz", q: "From the mixer lesson: which tracks are usually panned to the centre?", options: ["Kick and bass", "Hi-hats only", "Pads only", "None"], answer: 0, explain: "Low sounds stay centred so the power is shared across both speakers." },
    { kind: "summary", learned: ["MIDI tracks need an instrument", "Samples live on audio tracks", "Name tracks by job as you build"] },
  ],

  "what-is-live": [
    { kind: "hook", emoji: "🧭", headline: "One program, two ways to work", subtext: "Session is for ideas. Arrangement is for songs." },
    { kind: "concept", title: "Two views", body: "Session View is a grid of clips you can launch in any order, good for jamming and trying ideas. Arrangement View is a timeline that runs left to right, good for finishing a track.", keyFact: "Press Tab to switch between them." },
    { kind: "interact", sim: "interface-tour", prompt: "Find the Browser, the clips and the control bar." },
    { kind: "match", prompt: "Which view is best for the job?", pairs: [{ left: "Trying loops against each other", right: "Session View" }, { left: "Fixing a mistake in bar 40", right: "Arrangement View" }, { left: "Finding an instrument to add", right: "The Browser" }] },
    { kind: "quiz", q: "You have a loop you like and want a four-minute song. Which view do you move to?", options: ["Arrangement View", "Session View", "The Browser", "Preferences"], answer: 0, explain: "Arrangement lays the song along a timeline so you can plan sections, intros and drops. Session is where you found the loop." },
    { kind: "concept", title: "Where things live", body: "The Browser on the left holds your sounds, devices and projects. Devices you drop on a track show along the bottom. The control bar at the top holds play, record and tempo.", keyFact: "Browser left, devices below, transport above." },
    { kind: "quiz", q: "Where do you find an instrument or effect to add to a track?", options: ["The Browser on the left", "The control bar", "The Master track", "The scroll bar"], answer: 0, explain: "The Browser lists instruments, audio effects, MIDI effects, sounds and your own files. Drag from it onto a track." },
    { kind: "quiz", q: "You change your original sample by warping and reversing it. What happens to the file on disk?", options: ["Nothing, the original is untouched", "It is overwritten", "It is deleted", "It is converted to MIDI"], answer: 0, explain: "Live edits are non-destructive. Clips point at your file and store the changes in the Set, so you can try anything." },
    { kind: "quiz", q: "Which shortcut switches between Session and Arrangement?", options: ["Tab", "Space", "Shift + Q", "Cmd/Ctrl + W"], answer: 0, explain: "Tab flips views. Space starts and stops playback." },
    { kind: "summary", learned: ["Session for ideas, Arrangement for songs", "Tab switches views", "Edits never change your original files"] },
  ],

  "tempo-bpm": [
    { kind: "hook", emoji: "⏱️", headline: "Tempo sets the feel before any sound does", subtext: "Genres have a home range. Know yours." },
    { kind: "concept", title: "What BPM is", body: "BPM is beats per minute. A beat is one pulse you would tap your foot to. At 120 BPM there are two beats every second.", keyFact: "120 BPM is two beats per second.", visual: "bpm-grid" },
    { kind: "interact", sim: "bpm-tap", prompt: "Tap along and find the tempo." },
    { kind: "match", prompt: "Match the genre to its usual tempo", pairs: [{ left: "House", right: "About 120 to 128 BPM" }, { left: "Techno", right: "About 125 to 140 BPM" }, { left: "Drum and bass", right: "About 170 to 175 BPM" }, { left: "Hip hop", right: "About 80 to 100 BPM" }] },
    { kind: "quiz", q: "Dubstep is often set at 140 BPM but feels slow, like a 70 BPM track. Why?", options: ["Its drums play in half-time, with the snare on every second beat", "Live slows it down", "140 BPM is a slow tempo", "The bass is turned down"], answer: 0, explain: "In half-time the snare lands once per bar instead of twice. The tempo is fast, but the groove feels like half of it." },
    { kind: "quiz", q: "You need to match a record at 126 BPM. What do you set Live's tempo to?", options: ["126", "120", "63", "252"], answer: 0, explain: "Match the tempo first. Doubling or halving only makes sense when the groove is intentionally half or double time." },
    { kind: "concept", title: "Tempo and your sample", body: "A loop recorded at 100 BPM and played at 120 BPM will not line up unless it is warped. Live stretches the audio to match the Set tempo when Warp is on.", keyFact: "Warp lets a loop follow the Set tempo." },
    { kind: "quiz", q: "A drum loop is faster than your Set and does not line up. What is the most likely cause?", options: ["Warp is off or the loop is not warped correctly", "The Master is too loud", "The track is a return", "The loop is stereo"], answer: 0, explain: "Without warp, Live plays the audio at its recorded speed. Turn Warp on and check the loop length." },
    { kind: "quiz", q: "From the tracks lesson: where does a sample you drag in land?", options: ["An audio track", "A MIDI track", "The master", "A return"], answer: 0, explain: "Samples and recordings are audio, and audio lives on audio tracks." },
    { kind: "summary", learned: ["BPM is beats per minute", "Genres have home tempo ranges", "Warp keeps loops in time with your Set"] },
  ],

  "chord-progressions": [
    { kind: "hook", emoji: "🎹", headline: "Four chords carry a thousand songs", subtext: "The order of the chords is the song's story." },
    { kind: "concept", title: "What a progression is", body: "A chord progression is a sequence of chords that repeats under a melody. Each chord is named by its position in the key with a Roman numeral, so the pattern works in any key.", keyFact: "I, IV, V and vi are the most used chords in pop." },
    { kind: "interact", sim: "chord-stacker", prompt: "Build C, G, Am, F and play them in order." },
    { kind: "match", prompt: "Match the Roman numeral to the chord in C major", pairs: [{ left: "I", right: "C" }, { left: "IV", right: "F" }, { left: "V", right: "G" }, { left: "vi", right: "Am" }] },
    { kind: "quiz", q: "I, V, vi, IV in the key of C major is which set of chords?", options: ["C, G, Am, F", "C, F, G, Am", "Am, F, C, G", "C, Dm, Em, F"], answer: 0, explain: "I is C, V is G, vi is Am and IV is F. This is the famous pop progression found in a huge number of songs." },
    { kind: "quiz", q: "Why do progressions use Roman numerals instead of chord names?", options: ["The pattern is the same in any key", "Roman numerals are louder", "Live needs them", "Only minor keys use letters"], answer: 0, explain: "A song can be moved up or down to suit a singer while the numerals stay the same." },
    { kind: "concept", title: "Tension and release", body: "V pulls toward I, like a question waiting for its answer. The IV chord feels open and the vi chord adds a touch of sadness.", keyFact: "V wants to go home to I." },
    { kind: "quiz", q: "A progression ends on V and feels unfinished. What is the likely next chord?", options: ["I", "vi", "ii", "iii"], answer: 0, explain: "V resolves most strongly to I. Ending on V keeps listeners waiting, which is why it is used before a drop or a chorus." },
    { kind: "quiz", q: "A minor-key progression is i, VI, III, VII. In A minor which chords are those?", options: ["Am, F, C, G", "Am, G, F, C", "A, F, C, G", "Am, Dm, E, F"], answer: 0, explain: "In A minor the notes are A B C D E F G, so VI is F, III is C and VII is G." },
    { kind: "quiz", q: "From the tempo lesson: Roughly what BPM do house tracks use?", options: ["120 to 128", "170 to 175", "80 to 100", "200 and up"], answer: 0, explain: "House sits around 120 to 128 BPM, a steady dance pulse." },
    { kind: "summary", learned: ["Roman numerals name chords by position in the key", "I, V, vi, IV is the classic pop loop", "V creates tension, I releases it"] },
  ],

  "groups-routing": [
    { kind: "hook", emoji: "🧩", headline: "Mix eight drum tracks as one", subtext: "A group track is a bus you can process together." },
    { kind: "concept", title: "What a group does", body: "A group track bundles several tracks. Their sound is summed on the group, so one fader, one compressor and one EQ can treat the whole drum kit together.", keyFact: "Group = one fader and one effect chain for many tracks.", visual: "mixer-channel" },
    { kind: "interact", sim: "routing-puzzle", prompt: "Route the tracks to the right place." },
    { kind: "quiz", q: "You want all your drums compressed together so they sound like one kit. Where does the compressor go?", options: ["On the group track", "On the kick only", "On a return", "On the Master only"], answer: 0, explain: "A compressor on the group reacts to the sum of the drums, which glues them together. Separate compressors on each track do not." },
    { kind: "sequence", prompt: "Group your drums", items: ["Select the first drum track", "Shift + click the last drum track", "Press Cmd/Ctrl + G", "Name the group Drums", "Put Glue Compressor on the group"], explain: "You select, group and name first. The processing goes on the group once it exists." },
    { kind: "quiz", q: "You grouped your drums and now the kick is hard to find. What is the quickest way to adjust only the kick?", options: ["Open the group and use the kick's own fader", "Delete the group", "Turn the group down", "Move the kick to the Master"], answer: 0, explain: "Each track keeps its own fader inside the group. Group controls move everything together, track controls move one." },
    { kind: "match", prompt: "Which one do you use?", pairs: [{ left: "Make the whole kit louder", right: "Group fader" }, { left: "Fix one hat that is too bright", right: "That track's EQ" }, { left: "Glue drums into one sound", right: "Compressor on the group" }, { left: "Add the same reverb to many tracks", right: "A return track" }] },
    { kind: "quiz", q: "From the sends lesson: when you place Reverb on a return, where should Dry/Wet be?", options: ["100 percent wet", "0 percent", "50 percent", "It does not matter"], answer: 0, explain: "The original track carries the dry sound, so the return carries only the effect." },
    { kind: "summary", learned: ["Cmd/Ctrl + G groups selected tracks", "Process the group to glue sounds together", "Each track keeps its own fader inside the group"] },
  ],

  automation: [
    { kind: "hook", emoji: "📈", headline: "A static mix is a boring mix", subtext: "Automation makes things move over time." },
    { kind: "concept", title: "What automation is", body: "Automation is a line you draw that moves a control over time. A filter can open across eight bars, a volume can dip before a drop, a reverb can swell on the last beat.", keyFact: "Any control can move. You draw the line." },
    { kind: "interact", sim: "lfo-lab", prompt: "Watch a control move over time." },
    { kind: "sequence", prompt: "Draw your first automation", items: ["Switch to Arrangement View", "Press A for Automation Mode", "Choose the device and the parameter", "Click to add breakpoints on the line", "Play it back and listen"], explain: "You choose what to move before you draw. The playback check is last, because you hear what the line really does." },
    { kind: "quiz", q: "You touch an automated knob while playing and then the automation stops following the line. What do you click?", options: ["Re-Enable Automation", "Undo twice", "Stop the project", "Delete the track"], answer: 0, explain: "Moving an automated control by hand overrides the line, and the Re-Enable Automation button turns orange. Click it to hand control back to the line." },
    { kind: "match", prompt: "Which automation suits the job?", pairs: [{ left: "A rising build before a drop", right: "Filter cutoff opening" }, { left: "A big space at the end of a phrase", right: "Reverb send swelling" }, { left: "A gap before the drop", right: "Volume dipping" }, { left: "Movement on a held pad", right: "A slow wobble on a device knob" }] },
    { kind: "quiz", q: "You need a build that tightens across 16 bars. Which line works best?", options: ["A gradual rise over all 16 bars", "A single step at bar 16", "A random zigzag", "A flat line"], answer: 0, explain: "Builds work because they change a little all the time. A slow rise gives the listener a sense of something arriving." },
    { kind: "quiz", q: "From the groups lesson: where does a compressor go to glue a drum kit?", options: ["On the group track", "On the kick", "On a return", "On the Master only"], answer: 0, explain: "The group's compressor reacts to the sum of the drums." },
    { kind: "summary", learned: ["Press A in Arrangement to draw automation", "Choose the device and parameter first", "Re-Enable Automation hands control back to the line"] },
  ],

  "saturator-distortion": [
    { kind: "hook", emoji: "🔥", headline: "Make it thicker without making it louder", subtext: "Saturation adds harmonics that fill out a thin sound." },
    { kind: "concept", title: "What saturation does", body: "A saturator bends the waveform, which adds harmonics, new higher notes that were not there. A thin bass gets more body and a dull hat gets more bite.", keyFact: "Distortion adds harmonics. Harmonics add presence.", visual: "waveform-compare" },
    { kind: "interact", sim: "waveform-visualizer", prompt: "Compare a pure wave with a bent one." },
    { kind: "quiz", q: "A sub bass vanishes on a laptop speaker. What helps most?", options: ["Add saturation so harmonics play on small speakers", "Turn up the sub", "Cut the highs", "Add reverb"], answer: 0, explain: "Small speakers cannot play very low notes, but they can play the harmonics saturation adds. That is how a bass stays audible." },
    { kind: "concept", title: "The trap", body: "More drive makes the sound louder, so it will always seem better. Lower Output until the loudness matches the dry version, then decide.", keyFact: "Match the loudness, then compare." },
    { kind: "quiz", q: "You raise Drive on a Saturator and the sound seems better. What do you check?", options: ["That Output is lowered so loudness is unchanged", "That the track is on a return", "That Warp is on", "That the tempo is correct"], answer: 0, explain: "A louder sound feels fuller and clearer. Matching the level removes the bias." },
    { kind: "match", prompt: "Match the sound to the amount", pairs: [{ left: "A gentle warmth on a bus", right: "Low Drive, blended in" }, { left: "A gritty lead", right: "High Drive" }, { left: "Keeping peaks in check", right: "Post Clip Mode set to Soft Clip" }, { left: "Keeping the original punch", right: "Dry/Wet below 100 percent" }] },
    { kind: "quiz", q: "From the EQ lesson: which area is usually called mud?", options: ["About 200 to 400 Hz", "Under 30 Hz", "Above 10 kHz", "2 to 5 kHz"], answer: 0, explain: "Saturation can add energy there, so check the low mids after you add drive." },
    { kind: "summary", learned: ["Saturation adds harmonics", "Match loudness before judging", "Blend with Dry/Wet to keep punch"] },
  ],

  "limiter-truepeak": [
    { kind: "hook", emoji: "🧱", headline: "A ceiling for your loudest moment", subtext: "A limiter stops peaks from going past a set level." },
    { kind: "concept", title: "What a limiter does", body: "A limiter is a compressor with a very high ratio and a ceiling. Nothing gets past the ceiling, so you can raise the overall level without clipping.", keyFact: "Raise Gain, the Ceiling holds the peaks.", visual: "headroom-meter" },
    { kind: "interact", sim: "mixer", prompt: "Raise the master and watch the peaks." },
    { kind: "quiz", q: "Where does a limiter usually go?", options: ["At the end of the Master chain", "On the first track", "On a return", "Before the instrument"], answer: 0, explain: "It is the last safety net, so it sits at the end of the Master chain. Every sound reaches it." },
    { kind: "quiz", q: "Why set the Ceiling to minus 1 dB instead of 0 dB?", options: ["Converting to MP3 or AAC can create peaks above the original, and the extra room avoids clipping", "To make the track quieter", "Live requires it", "To add reverb"], answer: 0, explain: "Lossy encoding can push peaks slightly higher. A little room below 0 dB prevents distortion on streaming services." },
    { kind: "quiz", q: "The limiter shows 10 dB of reduction and the track sounds crushed. What should you do first?", options: ["Fix the mix and lower the Gain", "Raise the Ceiling", "Turn off the master", "Increase Release"], answer: 0, explain: "A limiter is a safety net, not a volume knob. If you need much more than 3 or 4 dB, the mix underneath needs work." },
    { kind: "sequence", prompt: "Set up a limiter", items: ["Click the Master track", "Add Limiter at the end of the chain", "Set the Ceiling to minus 1 dB", "Raise Gain slowly", "Stop before it sounds crunchy"], explain: "You place and set the ceiling first so you cannot clip, then raise Gain by ear." },
    { kind: "quiz", q: "From the mixer lesson: roughly where should your mix peaks sit before the limiter?", options: ["Around minus 6 dB", "At 0 dB", "Above 0 dB", "At minus 60 dB"], answer: 0, explain: "Headroom while mixing gives the limiter room to work." },
    { kind: "summary", learned: ["A limiter sits last on the Master", "Ceiling at minus 1 dB leaves room for encoding", "Heavy limiting means fix the mix first"] },
  ],

  "midi-piano-roll": [
    { kind: "hook", emoji: "🎹", headline: "Draw the notes you cannot play", subtext: "The piano roll is where MIDI becomes music." },
    { kind: "concept", title: "How to read it", body: "Up and down is pitch, left to right is time. Each block is a note: its row is the pitch, its length is how long it lasts and its shading shows how hard it was played (velocity).", keyFact: "Row is pitch. Width is length. Shading is velocity." },
    { kind: "interact", sim: "piano-roll", prompt: "Draw a four-note pattern." },
    { kind: "sequence", prompt: "Draw a chord progression", items: ["Insert a MIDI clip", "Press B for draw mode", "Draw three notes stacked for the first chord", "Copy it to the next bars and move the notes", "Add the root of each chord on another track"], explain: "A clip holds the notes, so it comes first. The second track for the bass line uses the same chords, one octave lower." },
    { kind: "quiz", q: "Your notes sound mechanical, every one equally loud. What helps?", options: ["Change velocity so some are softer", "Increase the tempo", "Turn off Quantize forever", "Delete half the notes"], answer: 0, explain: "Players never hit every note equally hard. Varying velocity makes patterns feel played." },
    { kind: "quiz", q: "You are not sure which notes fit the key. Which tool helps in Live 12?", options: ["Scale Mode highlights notes in the scale", "The Browser", "The Tuner", "The Looper"], answer: 0, explain: "Scale Mode in the clip view shades the rows that belong to your chosen scale, so you can draw without worrying about wrong notes." },
    { kind: "match", prompt: "Match the shortcut to the job", pairs: [{ left: "B", right: "Draw mode on or off" }, { left: "Cmd/Ctrl + A", right: "Select all notes" }, { left: "Cmd/Ctrl + D", right: "Duplicate the selection" }, { left: "Cmd/Ctrl + Shift + M", right: "Insert a MIDI clip" }] },
    { kind: "quiz", q: "From the tracks lesson: what must a MIDI track have to make sound?", options: ["An instrument", "A return", "An audio clip", "A group"], answer: 0, explain: "MIDI is only notes. An instrument turns them into sound." },
    { kind: "summary", learned: ["Row is pitch, width is length", "Velocity makes patterns feel played", "Scale Mode keeps your notes in key"] },
  ],

  "bass-poli": [
    { kind: "hook", emoji: "🔊", headline: "A bass line makes people move", subtext: "Simple, short and in the right place." },
    { kind: "concept", title: "What a good bass line does", body: "It plays the root of each chord, locks with the kick and leaves gaps. The lowest note you hear is the foundation for everything above it.", keyFact: "Follow the chords. Lock with the kick. Leave gaps." },
    { kind: "interact", sim: "bassline-lab", prompt: "Build a bass line under the kick." },
    { kind: "quiz", q: "Your bass line plays on every beat along with the kick and the low end is muddy. What do you try?", options: ["Move some notes off the kick and shorten them", "Add more notes", "Raise the bass fader", "Add reverb"], answer: 0, explain: "A bass that plays between kicks leaves the kick room to punch. Shorter notes also stop the low end building up." },
    { kind: "concept", title: "Where the notes go", body: "Bass notes usually sit in the first two octaves, around C1 to C2. Lower than that and small speakers cannot play them; higher and they start to clash with the chords.", keyFact: "C1 to C2 is a good home for bass." },
    { kind: "match", prompt: "Which synth for which bass?", pairs: [{ left: "A clean sub", right: "A sine wave" }, { left: "A growling bass", right: "A sawtooth with a filter" }, { left: "A hard FM bite", right: "Operator" }, { left: "A moving modern bass", right: "Wavetable" }] },
    { kind: "quiz", q: "A bass note fights with the chord above it. What is the simplest fix?", options: ["Play the root of the chord instead", "Make the note longer", "Raise the chord", "Add a delay"], answer: 0, explain: "The root of the chord supports the harmony. Other notes can create clashes with the pad or keys." },
    { kind: "quiz", q: "From the sidechain lesson: what do you put on the bass to make it duck under the kick?", options: ["A Compressor with the kick as its sidechain source", "A Reverb", "A second kick", "An EQ on the master"], answer: 0, explain: "The compressor goes on the bass and the kick triggers it." },
    { kind: "summary", learned: ["Play the chord root and leave gaps", "Bass lives around C1 to C2", "Duck it under the kick with sidechain"] },
  ],

  "sampler-simpler": [
    { kind: "hook", emoji: "🎤", headline: "Any sound can become an instrument", subtext: "Drop in a sample and play it across the keyboard." },
    { kind: "concept", title: "Simpler in one idea", body: "Simpler plays one sample, higher or lower depending on the note. Drop in a vocal, a bell or a bass hit and you can play it like a keyboard.", keyFact: "One sample, many notes.", visual: "waveform-zoom" },
    { kind: "interact", sim: "warp-lab", prompt: "Play the sample at different pitches." },
    { kind: "match", prompt: "Match the mode to the job", pairs: [{ left: "Classic", right: "Play a sample across the keys, with a loop" }, { left: "One-Shot", right: "Fire a whole sound once, like a drum hit" }, { left: "Slice", right: "Chop a loop into playable pieces" }] },
    { kind: "quiz", q: "You want a vocal chop that plays in full once per key press, whatever the key length. Which mode?", options: ["One-Shot", "Classic", "Slice", "Warp"], answer: 0, explain: "One-Shot plays the sample from start to end when you trigger it, which suits drum hits and vocal chops." },
    { kind: "quiz", q: "You want to rearrange the hits in a drum loop. Which mode?", options: ["Slice", "Classic", "One-Shot", "None"], answer: 0, explain: "Slice cuts the loop into pieces, one per key, so you can re-sequence them. You can slice by transient, beat, region or manually." },
    { kind: "sequence", prompt: "Play a sample", items: ["Drag Simpler onto a MIDI track", "Drop a sample on its waveform", "Insert a clip", "Draw four or more notes", "Pick a mode and listen"], explain: "Simpler needs a sample before the notes can do anything." },
    { kind: "quiz", q: "From the piano roll lesson: what does the vertical position of a note show?", options: ["Pitch", "Length", "Velocity", "Track"], answer: 0, explain: "Up and down is pitch. Simpler plays the sample higher for notes above the root." },
    { kind: "summary", learned: ["Simpler plays one sample across the keys", "One-Shot for hits, Slice for loops", "Notes only work once a sample is loaded"] },
  ],

  "reverb-delay": [
    { kind: "hook", emoji: "🏔️", headline: "Space turns flat into deep", subtext: "Reverb is a room. Delay is an echo." },
    { kind: "concept", title: "Two ways to make space", body: "Reverb adds the sense of a room: sound bouncing around, melting together. Delay repeats the sound after a set time, so you hear it again and again.", keyFact: "Reverb is a place. Delay is a repeat.", visual: "stereo-field" },
    { kind: "interact", sim: "send-return", prompt: "Send a track into the reverb." },
    { kind: "match", prompt: "Which effect fits?", pairs: [{ left: "Make a vocal sound like it is in a hall", right: "Reverb with a long decay" }, { left: "Add a rhythmic echo to a lead", right: "Delay synced to the tempo" }, { left: "Keep a snare tight but alive", right: "Short room reverb" }, { left: "Widen a sound without washing it out", right: "A short delay on a send" }] },
    { kind: "quiz", q: "A reverb makes your drums muddy and slow. What do you change first?", options: ["Shorten the Decay Time", "Lengthen the Decay Time", "Raise Dry/Wet on the track", "Add another reverb"], answer: 0, explain: "A long tail lasts into the next hit and blurs the rhythm. Shorter decay keeps the beat clear." },
    { kind: "quiz", q: "A delay set to 1/8 at 120 BPM repeats how often?", options: ["Every quarter of a second", "Every second", "Every two seconds", "Every beat"], answer: 0, explain: "At 120 BPM a beat is half a second. An eighth note is half a beat, so a quarter of a second." },
    { kind: "quiz", q: "You want the vocal clear but wet in the chorus. How?", options: ["Automate the send to the reverb up in the chorus", "Put a reverb on the vocal at 100 percent", "Mute the reverb", "Slow the tempo"], answer: 0, explain: "A send gives you control over how much space each part gets. Automating it lets the vocal move forward and back." },
    { kind: "quiz", q: "From the sends lesson: how much of a reverb on a return should be dry?", options: ["None, 100 percent wet", "All of it", "Half", "It depends on the Set"], answer: 0, explain: "The dry sound stays on the original track." },
    { kind: "summary", learned: ["Reverb is a room, delay is a repeat", "Shorter decay keeps rhythm tight", "Use sends and automate them for control"] },
  ],

  "glue-compressor": [
    { kind: "hook", emoji: "🧲", headline: "Make separate sounds feel like one", subtext: "Light compression on a group holds a mix together." },
    { kind: "concept", title: "What glue means", body: "When a group of sounds is compressed together, the loudest hit turns them all down a little. They breathe together, which is why the group sounds like one thing.", keyFact: "Gentle, on the group, 1 to 3 dB." },
    { kind: "interact", sim: "comp-lake", prompt: "Compress the group and watch the peaks." },
    { kind: "match", prompt: "Match the setting to what it does", pairs: [{ left: "Slow attack", right: "Lets the hits through before it grabs" }, { left: "Auto Release", right: "Adapts the release to the sound itself" }, { left: "Low ratio, 2:1", right: "Subtle, musical squeeze" }, { left: "Dry/Wet", right: "Blends the compressed sound with the original" }] },
    { kind: "quiz", q: "You hear pumping on your drum group. What do you do?", options: ["Raise the Threshold or lower the Ratio", "Lower the Threshold", "Raise the Ratio", "Turn off the group"], answer: 0, explain: "Pumping means the compressor is working too hard. Less reduction gives a gentler glue." },
    { kind: "quiz", q: "Where does Glue Compressor do its best work?", options: ["On a group of related tracks", "On a lone reverb return", "On a muted track", "On a MIDI track with no instrument"], answer: 0, explain: "It is a bus compressor, designed to treat several sounds as one." },
    { kind: "quiz", q: "From the compressor lesson: before judging compression, what should you match?", options: ["The level with it on and off", "The attack", "The ratio", "The key"], answer: 0, explain: "Louder sounds better, so level-match to judge honestly." },
    { kind: "summary", learned: ["Glue works best on groups", "1 to 3 dB of reduction is plenty", "Pumping means ease off"] },
  ],

  "scale-awareness": [
    { kind: "hook", emoji: "🎼", headline: "Never play a wrong note again", subtext: "Scale tools keep every note in key." },
    { kind: "concept", title: "What a scale does", body: "A scale is a set of notes that sound good together. If you only play notes from one scale, the melody and chords will not clash.", keyFact: "Stay in the scale and nothing clashes.", visual: "scale-steps" },
    { kind: "interact", sim: "scale-aware", prompt: "Play notes in and out of the scale." },
    { kind: "quiz", q: "You choose C major in the Scale MIDI effect and play a C sharp. What happens?", options: ["It is moved to the nearest note in the scale", "It plays as C sharp", "The track mutes", "It plays a chord"], answer: 0, explain: "Scale remaps notes that fall outside the chosen scale to the nearest note that is in it." },
    { kind: "quiz", q: "Where does Scale go in the device chain?", options: ["Before the instrument", "After the instrument", "On the Master", "On a return"], answer: 0, explain: "It changes notes on the way in. After the instrument, the notes have already been played." },
    { kind: "match", prompt: "Match the scale to the mood", pairs: [{ left: "Major", right: "Bright and open" }, { left: "Natural minor", right: "Darker and sadder" }, { left: "Pentatonic", right: "Simple, forgiving melodies" }, { left: "Chromatic", right: "Every note, no limits" }] },
    { kind: "quiz", q: "From the chord progressions lesson: in C major, what chord is the V?", options: ["G", "F", "Am", "Dm"], answer: 0, explain: "V is the fifth note of the scale, G." },
    { kind: "summary", learned: ["A scale is a set of notes that fit", "Scale remaps notes to the nearest in key", "Put Scale before the instrument"] },
  ],
};

/** Small seeded generator so the shuffle is the same on every build and every render. */
function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

/**
 * Authors tend to write the right answer first. Quiz options are not shuffled by the screen
 * component, so the right answer would always be the first button. This puts the options of every
 * quiz and audio-id screen in a fixed random order per lesson and remaps `answer` to match.
 */
function shuffleAnswers(slug: string, screens: LessonScreen[]): LessonScreen[] {
  return screens.map((s, i) => {
    if ((s.kind !== "quiz" && s.kind !== "audio-id") || s.options.length < 2) return s;
    const rand = seeded(`${slug}:${i}`);
    const order = s.options.map((_, k) => k);
    for (let k = order.length - 1; k > 0; k--) {
      const j = Math.floor(rand() * (k + 1));
      [order[k], order[j]] = [order[j], order[k]];
    }
    return { ...s, options: order.map((k) => s.options[k]), answer: order.indexOf(s.answer) };
  });
}

const ALL_FLAGSHIP: Record<string, LessonScreen[]> = { ...FLAGSHIP_BATCH_1, ...FLAGSHIP_BATCH_2A, ...FLAGSHIP_BATCH_2B, ...FLAGSHIP_BATCH_3A, ...FLAGSHIP_BATCH_3B };

export const FLAGSHIP_SCREENS: Record<string, LessonScreen[]> = Object.fromEntries(
  Object.entries(ALL_FLAGSHIP).map(([slug, screens]) => [slug, shuffleAnswers(slug, screens)]),
);
