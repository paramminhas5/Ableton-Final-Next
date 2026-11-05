import { describe, expect, it } from "vitest";
import { velocityFromY } from "../src/lib/touch";

describe("velocity from where you hit a pad", () => {
  it("the top edge is loudest, the bottom softest, and it never leaves 0.3..1", () => {
    expect(velocityFromY(100, 100, 60)).toBe(1);
    expect(velocityFromY(160, 100, 60)).toBe(0.3);
    expect(velocityFromY(130, 100, 60)).toBeCloseTo(0.65, 2);
    expect(velocityFromY(0, 100, 60)).toBe(1);
    expect(velocityFromY(999, 100, 60)).toBe(0.3);
  });
});
