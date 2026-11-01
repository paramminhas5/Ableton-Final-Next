import type { LessonScreen } from "./types";

/**
 * Batch 4, part B: crate digging to EQ mixing. Same rules as batch 4A.
 * Where gear differs between models (pitch fader direction, hot cue pad count, waveform
 * colours) the lesson teaches the idea and tells the learner to check their own unit.
 */
export const FLAGSHIP_BATCH_4B: Record<string, LessonScreen[]> = {
  "crate-digging": [
    { kind: "hook", emoji: "📦", headline: "The track nobody else has is the one they remember", subtext: "Digging is how you build a sound that is yours." },
    { kind: "concept", title: "Where to look", body: "Crate digging used to mean flipping through record bins. Now it includes online stores such as Beatport, Bandcamp, Juno and Traxsource, artist and label pages, mixes and radio shows, and other DJs' charts. The skill is the same: listen widely, keep what moves you.", keyFact: "Listen widely, keep what moves you." },
    { kind: "interact", sim: "browser-tour", prompt: "Browse a library. Find tracks by label." },
    { kind: "concept", title: "Follow labels and artists", body: "Labels tend to have a sound. If you love four of their releases, the fifth is worth a listen. Mixes and radio shows reveal tracks before you would find them in a store.", keyFact: "Trust labels you already love." },
    { kind: "quiz", q: "You love three releases from one small label. What is the sensible next step?", options: ["Listen to the label's other releases and follow its new ones", "Ignore the label from now on", "Only buy the biggest hits", "Copy their tracklists exactly"], answer: 0, explain: "A label's taste is consistent. Following one you trust is one of the fastest ways to find music that fits your sound.", hint: "Taste repeats." },
    { kind: "quiz", q: "You hear a track in a mix and want to find it. What is the most useful thing to do?", options: ["Check the mix's tracklist or the DJ's page, or ask the DJ", "Give up", "Buy the first similar track", "Search only by BPM"], answer: 0, explain: "Tracklists and artist pages are the quickest routes to the exact track. Asking the DJ often works too.", hint: "Someone already knows." },
    { kind: "concept", title: "Pay for the music", body: "Buying tracks supports the artists and labels who make them. It also gives you better files than most free copies. A library you paid for is a library you can play anywhere.", keyFact: "Buying music keeps the scene alive." },
    { kind: "quiz", q: "From an earlier lesson: why keep your library in two places?", options: ["A single drive can fail and take everything with it", "It makes tracks louder", "It changes the key", "It speeds up analysis"], answer: 0, explain: "Backups are the protection against drive failure." },
    { kind: "summary", learned: ["Dig across stores, labels, mixes and charts", "Follow labels and artists you already trust", "Buy the music you play"] },
  ],

  "export-mode-dj": [
    { kind: "hook", emoji: "💾", headline: "Your laptop stays home. Your USB walks into the club.", subtext: "Preparation in Export mode decides how the night goes." },
    { kind: "concept", title: "The order that works", body: "Import tracks, let rekordbox analyse them, check the beat grids, set your cue points, build playlists, then export them to your USB. Doing it in that order means the USB carries the grids and cues you checked.", keyFact: "Analyse, check grids, set cues, then export." },
    { kind: "interact", sim: "browser-tour", prompt: "Pick a playlist. Export it to a USB." },
    { kind: "concept", title: "Export again after changes", body: "The USB holds a copy from when you exported. If you change a grid, a cue or a playlist afterwards, export again so the USB matches. A mismatch is a classic reason a cue is missing at the club.", keyFact: "Changed something? Export again." },
    { kind: "quiz", q: "You set new cue points on three tracks at home, but at the club they are missing from the CDJ. What is the likely reason?", options: ["The USB was exported before the cues were added", "The CDJ is broken", "The cues were too loud", "The tracks were too long"], answer: 0, explain: "The USB only has what existed when you last exported. Re-export after any change and check on a player before the gig.", hint: "When did you export?" },
    { kind: "concept", title: "Two USBs", body: "USB drives fail and sometimes the club player reads one badly. Bring two identical drives, one as the spare. Format them the way your player's manual and rekordbox recommend.", keyFact: "Two identical USBs. Never one." },
    { kind: "quiz", q: "A club player will not read your USB. What is your best next move?", options: ["Plug in the spare USB", "Cancel the set", "Play from your phone without testing", "Ask the crowd"], answer: 0, explain: "That is exactly what the spare is for. It only helps if it is an identical, tested copy.", hint: "That is why there are two." },
    { kind: "sequence", prompt: "Put the Export mode steps in order", items: ["Import tracks", "Let rekordbox analyse them", "Check the beat grids", "Set cue points", "Export to the USB"], explain: "Analysis needs the track first, grids and cues rely on analysis, and export last so the USB carries everything you checked." },
    { kind: "quiz", q: "From an earlier lesson: why check the beat grid before you set cue points?", options: ["Cues and loops snap to the grid, so a wrong grid puts them in the wrong place", "It makes the track louder", "It changes the key", "It is optional"], answer: 0, explain: "Anything that snaps to the grid inherits its mistakes." },
    { kind: "summary", learned: ["Prepare in order: analyse, grids, cues, export", "Re-export after any change", "Carry two identical USBs"] },
  ],

  "waveform-reading": [
    { kind: "hook", emoji: "🌊", headline: "See the track before you hear it", subtext: "The waveform shows you where the drop is coming." },
    { kind: "concept", title: "Shape tells structure", body: "A tall, dense stretch of waveform is a loud, full part of the track: a drop or main section. A thin, low stretch is quieter: an intro, breakdown or outro. Reading these shapes lets you plan a mix without listening to the whole track.", keyFact: "Tall and dense is full. Thin and low is quiet." },
    { kind: "interact", sim: "waveform-visualizer", prompt: "Find the breakdown. Find the drop." },
    { kind: "concept", title: "Colour shows frequency", body: "In a colour waveform, the colour shifts with which frequencies are present, so a bass-heavy part looks different from a bright hi-hat part. The exact colours differ by software and player, so open your waveform settings or legend to see which colour means what on yours.", keyFact: "Colour shows frequency. Check your legend." },
    { kind: "quiz", q: "You see a long thin section in the middle of a track, then a sudden tall dense block. What are you looking at?", options: ["A breakdown followed by a drop", "A broken file", "The intro", "The end of the track"], answer: 0, explain: "A quiet stretch followed by a full block is the classic breakdown and drop shape.", hint: "Quiet, then loud." },
    { kind: "quiz", q: "You want to mix out during a breakdown so the next track enters with no bass clash. What do you look for on the waveform?", options: ["A thin, low section where the low end drops out", "The tallest section", "The very first beat", "The brightest colour"], answer: 0, explain: "Breakdowns often lose the kick and bass, which makes them easy places to bring in a new track.", hint: "Where is the bass absent?" },
    { kind: "concept", title: "Use it with your ears", body: "The waveform shows what the file contains, not how it sounds on the system. Use it to plan, then listen to confirm.", keyFact: "Plan with your eyes. Confirm with your ears." },
    { kind: "quiz", q: "From an earlier lesson: what does a wrong beat grid affect?", options: ["Sync, loops and cue snapping", "Only the track's colour", "Only the file size", "Nothing"], answer: 0, explain: "Anything that depends on the grid will be wrong if the grid is wrong." },
    { kind: "summary", learned: ["Tall and dense is full, thin and low is quiet", "Colour shows frequency, check your own legend", "Plan with your eyes, confirm with your ears"] },
  ],

  "beatmatching-manual": [
    { kind: "hook", emoji: "🥁", headline: "Two kicks that become one", subtext: "Beatmatching is the oldest DJ skill and still the one that saves you." },
    { kind: "concept", title: "Two things to match", body: "You match the tempo (how fast) and the phase (where the beats fall). Tempo is set with the pitch control. Phase is fixed by nudging the track forward or back with the jog wheel. You need both: a matched tempo can still be off by half a beat.", keyFact: "Tempo with the pitch fader. Phase with the jog.", visual: "waveform-zoom" },
    { kind: "interact", sim: "beatmatch-trainer", prompt: "Match the tempo, then nudge the phase." },
    { kind: "concept", title: "Listen for drift", body: "Start the incoming track on beat, listen in your headphones against the master. If the incoming kick moves ahead of the master, it is too fast. If it falls behind, it is too slow. Adjust the pitch control and listen again. Which direction on the pitch fader speeds a track up depends on the unit, so check the percentage or BPM on the display.", keyFact: "Ahead means too fast. Behind means too slow." },
    { kind: "quiz", q: "The incoming kick keeps creeping ahead of the master kick. What do you do?", options: ["Slow the incoming track a little with the pitch control", "Speed it up more", "Turn up the EQ", "Pull the crossfader"], answer: 0, explain: "A kick moving ahead means the incoming track is faster. Bring its tempo down a touch and listen again.", hint: "Ahead means faster." },
    { kind: "quiz", q: "The two tempos match but you hear a flam, two kicks slightly apart that never drift. What fixes it?", options: ["Nudge the incoming track with the jog wheel", "Change the pitch fader", "Change the key", "Add reverb"], answer: 0, explain: "A steady offset means the phase is off, not the tempo. A small nudge brings the beats together.", hint: "Tempo is fine, position is not." },
    { kind: "concept", title: "Why learn it at all", body: "Sync is fast and reliable until the grid is wrong or a track has live drums. Manual beatmatching is the fallback that never goes out of date.", keyFact: "Manual is the safety net." },
    { kind: "sequence", prompt: "Put the beatmatching steps in order", items: ["Start the incoming track in headphones", "Listen for drift against the master", "Adjust the pitch control", "Nudge the phase with the jog", "Bring it into the speakers"], explain: "Match tempo first so the drift stops, then fix the phase, and only then let the room hear it." },
    { kind: "quiz", q: "From an earlier lesson: what does cue send to your headphones?", options: ["The channel before it reaches the speakers", "The speaker mix only", "The booth monitor", "Nothing"], answer: 0, explain: "Cue lets you hear a channel privately." },
    { kind: "summary", learned: ["Match tempo with the pitch control and phase with the jog", "Ahead means too fast, behind means too slow", "Manual skill is your backup when sync fails"] },
  ],

  "sync-function": [
    { kind: "hook", emoji: "🔗", headline: "A tool, not a shortcut", subtext: "Sync saves your hands for the parts that need them." },
    { kind: "concept", title: "What sync does", body: "Sync matches the tempo of one deck to another, and in many setups also lines up the beats using the beat grid. One deck acts as the master that the others follow. You can usually see which deck is the master on the display.", keyFact: "Sync follows the grid. One deck leads." },
    { kind: "interact", sim: "beatmatch-trainer", prompt: "Try sync. Then try it by hand." },
    { kind: "concept", title: "Where sync helps", body: "With sync handling the tempo, your hands are free for EQ, effects and loops. For tracks with a good grid and steady tempo it is fast and reliable, and many working DJs use it.", keyFact: "Sync frees your hands." },
    { kind: "quiz", q: "You press sync and the incoming track sounds off beat. What do you check first?", options: ["Whether the track's beat grid is correct", "The headphones", "The speaker volume", "The crossfader curve"], answer: 0, explain: "Sync trusts the grid. If the grid is wrong, sync follows the wrong beats.", hint: "What does sync rely on?" },
    { kind: "concept", title: "Where sync fails", body: "Tracks with live drums, tempo changes or a bad grid will not sync cleanly. Some older tracks have no consistent tempo at all. In those cases you need to beatmatch by hand.", keyFact: "Live drums and bad grids defeat sync." },
    { kind: "quiz", q: "You are playing a track with a human drummer whose tempo wanders. Sync keeps sliding off. What is the right call?", options: ["Beatmatch by hand and ride the pitch", "Keep pressing sync", "Mute the drums", "Skip every track like this"], answer: 0, explain: "A grid assumes steady tempo. A wandering drummer needs a human to follow them.", hint: "Software cannot follow a wandering tempo." },
    { kind: "quiz", q: "From an earlier lesson: why is the tempo half or double sometimes wrong after analysis?", options: ["Analysis can land on half or double the true tempo", "The file is corrupt", "The key is wrong", "The headphones are muted"], answer: 0, explain: "Half and double readings are common, especially on fast tracks." },
    { kind: "summary", learned: ["Sync follows the beat grid and one master deck", "It frees your hands when grids are good", "Live drums and bad grids need manual beatmatching"] },
  ],

  "cue-points-dj": [
    { kind: "hook", emoji: "📍", headline: "Jump to the drop without scrubbing", subtext: "Cue points are bookmarks inside a track." },
    { kind: "concept", title: "Two kinds, two jobs", body: "In rekordbox, memory cues mark points you want to remember and step between, such as the first beat, a breakdown or the outro. Hot cues are for instant jumps during a performance, and you can give them colours. Both are stored with the track in your collection.", keyFact: "Memory cues bookmark. Hot cues trigger." },
    { kind: "interact", sim: "hot-cue-drill", prompt: "Set hot cues. Trigger them." },
    { kind: "concept", title: "Where to put them", body: "Mark the places you will actually use: the first beat of the intro, the first drop, the main breakdown, and where the outro begins. With those four you can navigate any track without scrubbing.", keyFact: "Intro, drop, breakdown, outro." },
    { kind: "quiz", q: "You are mixing out and want to jump back to the drop of a track you are playing. Which cue helps?", options: ["A hot cue placed on the drop", "A cue on the very end of the track", "No cue, just scrub", "A cue on the intro only"], answer: 0, explain: "Hot cues are built for instant jumps while you perform. One on the drop lets you return in a single press.", hint: "Instant jump." },
    { kind: "quiz", q: "You set cues at home on a track but never export again. At the club, what happens?", options: ["The cues you added after the last export will be missing", "They appear anyway", "The track plays twice as fast", "The cues move by themselves"], answer: 0, explain: "The USB holds what you exported. Export again after changing cues, and check on a player.", hint: "Think about the last export." },
    { kind: "concept", title: "Cues depend on the grid", body: "In rekordbox, cues placed with the grid on snap to beats. A wrong grid means a cue that is slightly off. Fix the grid first and then place cues.", keyFact: "Grid first, cues second." },
    { kind: "quiz", q: "From an earlier lesson: what is a good order for Export preparation?", options: ["Analyse, check grids, set cues, export", "Export, then analyse", "Set cues, then import", "Check grids last"], answer: 0, explain: "Each step builds on the one before." },
    { kind: "summary", learned: ["Memory cues bookmark, hot cues trigger instantly", "Mark intro, drop, breakdown and outro", "Fix the grid, place cues, re-export"] },
  ],

  "eq-mixing-dj": [
    { kind: "hook", emoji: "🎚️", headline: "Never two bass lines at full volume", subtext: "The bass swap is how you keep a blend clean." },
    { kind: "concept", title: "Three bands, three jobs", body: "Low holds the kick and bass. Mid holds the body of most instruments and vocals. High holds the hats and brightness. Turning a band down removes that part of the sound from the track.", keyFact: "Low, mid, high: three parts of every track.", visual: "mixer-channel" },
    { kind: "interact", sim: "mixer", prompt: "Cut the incoming bass. Then swap." },
    { kind: "concept", title: "The bass swap", body: "Bring the incoming track in with its low EQ turned down. When the moment is right, bring its low up as you take the outgoing track's low down at the same time. For a short stretch you hear both tracks without a pile-up of bass.", keyFact: "One bass line at a time." },
    { kind: "quiz", q: "You bring in the next track with its bass at full while the first is still at full. The mix sounds muddy and the meter jumps. What should you do?", options: ["Cut the incoming low EQ and swap the basses together", "Turn the master up", "Pull the crossfader fast", "Boost the highs"], answer: 0, explain: "Two full bass lines add up and crowd the low end. Swapping them keeps just one at a time.", hint: "One bass at a time." },
    { kind: "quiz", q: "Two tracks have strong vocals and you can hear them fighting. Which tool helps?", options: ["Cut the mids on one of the tracks", "Boost the bass", "Raise the master", "Change the tempo"], answer: 0, explain: "Vocals and melodies live in the mids. Cutting mids on one track makes room for the other.", hint: "Where do vocals live?" },
    { kind: "match", prompt: "Match the band to what you hear", pairs: [{ left: "Low", right: "Kick and bass" }, { left: "Mid", right: "Vocals and most instruments" }, { left: "High", right: "Hats and brightness" }, { left: "All three cut", right: "The channel sounds silent" }] },
    { kind: "concept", title: "Keep it subtle", body: "A full kill of a band is dramatic. Often a partial cut is enough. Small moves sound smoother and are easier to correct if the room changes.", keyFact: "Small EQ moves, not slams." },
    { kind: "quiz", q: "From an earlier lesson: what sets how hot the signal is on a channel before the fader?", options: ["The channel gain", "The crossfader", "The headphone mix", "The booth level"], answer: 0, explain: "Gain sets the strength of the signal going into the channel." },
    { kind: "summary", learned: ["Low, mid and high are separate parts of a track", "Swap the bass so only one bass line plays", "Cut mids to separate clashing vocals"] },
  ],
};
