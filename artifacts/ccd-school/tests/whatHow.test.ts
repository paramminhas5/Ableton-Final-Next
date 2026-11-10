import { describe, expect, it } from "vitest";
import { whatHow } from "../src/lib/whatHow";

describe("a step's what and how (10 Nov)", () => {
  it("pulls the first instruction out of the text, and leaves the rest as the how", () => {
    const r = whatHow("Every song starts with a kick. Press rec, wait for the clicks, then tap the pad on every beat. Keep it steady.");
    expect(r.what).toBe("Press rec, wait for the clicks, then tap the pad on every beat.");
    expect(r.how).toBe("Every song starts with a kick. Keep it steady.");
  });
  it("skips a leading 'now' or 'one:'", () => {
    expect(whatHow("Your song is on deck a. One: bring deck b's fader up.").what).toBe("Bring deck b's fader up.");
    expect(whatHow("Now shape them in your loop.").what).toBe("Shape them in your loop.");
  });
  it("falls back to what the step's kind asks when there's no text", () => {
    expect(whatHow(undefined, "matchsound").what).toMatch(/lit knobs/);
  });
});
