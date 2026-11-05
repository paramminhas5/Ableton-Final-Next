import { describe, expect, it } from "vitest";
import { starterCopy } from "../src/lib/starterCopy";

describe("starter copy", () => {
  it("says a starter loop is playing when your song is empty", () => {
    expect(starterCopy("Your song is playing. Turn the knob.")).toBe("A starter loop is playing. Turn the knob.");
    expect(starterCopy("Your song is playing with your chords in it.")).toBe("A starter loop is playing, with chords in it.");
    expect(starterCopy("Your song is playing, with drive on your kick.")).toBe("A starter loop is playing, with drive on your kick.");
  });
  it("leaves other copy alone", () => {
    expect(starterCopy("Turn the cutoff down.")).toBe("Turn the cutoff down.");
  });
});
