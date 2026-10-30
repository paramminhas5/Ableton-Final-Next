/**
 * Getting Live ready. Menu names and defaults can differ a little between Live versions,
 * so each step says what to look for. School is written for Live 12.
 */
export interface SetupStep {
  id: string;
  title: string;
  why: string;
  do: string[];
  watch?: string;
}

export interface SetupSection {
  id: string;
  title: string;
  steps: SetupStep[];
}

export const SETUP: SetupSection[] = [
  {
    id: "install",
    title: "Install and authorise",
    steps: [
      { id: "edition", title: "Know your edition", why: "Editions include different devices and track limits. Max for Live comes with some editions only.", do: ["Open Live's About screen or your Ableton account page to see your edition.", "Compare editions on Ableton's site before buying for one device. Devices in School's Atlas that need Max for Live are marked."] },
      { id: "authorise", title: "Authorise Live", why: "Live runs in demo mode until it is authorised, and the demo cannot save.", do: ["Sign in to your Ableton account when Live asks, or follow the offline authorisation steps.", "Check it by saving a tiny Set. If saving works, you are authorised."] },
      { id: "core", title: "Install the Core Library", why: "The Core Library holds the stock sounds, presets and drum kits the lessons use.", do: ["Open the Packs view in Live's browser or the Packs page in your account.", "Install the Core Library first. Add other packs only when you need them; they use a lot of disk space."] },
    ],
  },
  {
    id: "audio",
    title: "Audio and MIDI",
    steps: [
      { id: "driver", title: "Choose your audio device", why: "Live needs to know which speakers or interface to play through.", do: ["Open Preferences, then the Audio tab.", "On Windows, choose an ASIO driver (your interface's own driver is best). On Mac, use CoreAudio.", "Click Test to hear a tone."], watch: "No sound usually means the wrong output device is selected, or the output is not enabled in Output Config." },
      { id: "buffer", title: "Set a buffer size", why: "A small buffer feels instant when you play, but can crackle; a large buffer is smooth but adds delay.", do: ["Start at 128 or 256 samples when playing instruments.", "Raise it to 512 or higher when mixing a heavy Set.", "Keep the sample rate at 44.1 kHz unless you have a reason to change it."] },
      { id: "midi", title: "Connect a MIDI keyboard or pad controller", why: "Live must be told to accept notes from it.", do: ["Plug it in, then open Preferences and the MIDI tab (called Link, Tempo and MIDI in some versions).", "Turn on Track for the controller's input so it plays instruments.", "Leave Remote off unless it is a control surface that should map knobs."], watch: "If a key plays but the track does not, check the track is armed with the record button and its input is set to All Ins." },
    ],
  },
  {
    id: "plugins",
    title: "Third-party plug-ins",
    steps: [
      { id: "formats", title: "Know the plug-in formats", why: "Live only loads formats it supports on your system.", do: ["On macOS, Live loads AU and VST3 (and VST2 if you allow it).", "On Windows, Live loads VST3 and VST2.", "Install plug-ins with the maker's installer. Do not drag files around by hand."] },
      { id: "scan", title: "Let Live find them", why: "A plug-in you installed is invisible until Live scans for it.", do: ["Open Preferences and the Plug-ins tab.", "Turn on the formats you use. On Windows, add a custom folder for VST2 if you use any.", "Click Rescan if a plug-in is missing, then restart Live."], watch: "Windows VST3 plug-ins install to a shared system folder by default. On macOS, VST3 and AU have shared system folders too." },
      { id: "stock-first", title: "Use stock devices first", why: "A Set made with stock devices opens on any computer. A Set with third-party plug-ins needs every plug-in installed to open fully.", do: ["Finish a track using stock devices.", "Add a third-party plug-in only to learn something stock devices cannot do.", "Use Freeze Track before sharing a Set that relies on plug-ins."] },
    ],
  },
  {
    id: "projects",
    title: "Saving and sharing",
    steps: [
      { id: "save", title: "Save Sets inside a project folder", why: "Live keeps a Set and its samples in a project folder. Moving only the .als file breaks the links to samples.", do: ["Use Save Live Set and keep the whole folder together.", "Live also keeps older copies in the project's Backup folder if something goes wrong."] },
      { id: "collect", title: "Collect All and Save before sharing", why: "It copies every sample the Set uses into the project, so nothing goes missing on another computer.", do: ["Choose File, then Collect All and Save.", "Zip the whole project folder, not just the .als file."], watch: "To check your work in CCD.SCHOOL, upload only the .als file at /link. The file is read in memory and never stored." },
    ],
  },
];
