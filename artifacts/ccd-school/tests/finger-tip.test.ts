import { describe, expect, it } from "vitest";
import { TIP_LIFT, fingerTipPlace, fingerTipWidth } from "../src/lib/fingerTip";

describe("the value beside the finger (touch to reveal)", () => {
  it("sits centred just above the finger", () => {
    expect(fingerTipPlace(200, 600, 390, 100)).toEqual({ left: 200, top: 600 - TIP_LIFT });
  });
  it("stays on screen at the sides and the top", () => {
    expect(fingerTipPlace(4, 600, 390, 100).left).toBe(58);
    expect(fingerTipPlace(388, 600, 390, 100).left).toBe(332);
    expect(fingerTipPlace(200, 10, 390, 100).top).toBe(TIP_LIFT);
  });
  it("is wide enough for its text, and never wider than the screen", () => {
    expect(fingerTipWidth("cutoff", "1.2 khz")).toBeGreaterThanOrEqual(7 * 9);
    const wide = fingerTipPlace(195, 500, 120, fingerTipWidth("a very long control name", "a very long value text"));
    expect(wide.left).toBe(60);
  });
});
