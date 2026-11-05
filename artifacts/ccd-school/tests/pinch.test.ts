import { describe, expect, it } from "vitest";
import { PITCH_ZOOM, TIME_ZOOM, anchorScroll, pinchAxis, pinchZoom, zoomLabel } from "../src/lib/pinch";

describe("pinch zoom on the note grid", () => {
  it("sideways fingers zoom time, fingers above each other zoom pitch", () => {
    expect(pinchAxis(120, 30)).toBe("time");
    expect(pinchAxis(-120, 30)).toBe("time");
    expect(pinchAxis(20, 140)).toBe("pitch");
  });
  it("zooms by how far the fingers spread, within its range", () => {
    expect(pinchZoom(1, 100, 200, TIME_ZOOM)).toBe(2);
    expect(pinchZoom(2, 100, 50, TIME_ZOOM)).toBe(1);
    expect(pinchZoom(1, 100, 900, TIME_ZOOM)).toBe(TIME_ZOOM.max);
    expect(pinchZoom(1, 100, 10, PITCH_ZOOM)).toBe(PITCH_ZOOM.min);
    expect(pinchZoom(1, -100, -150, PITCH_ZOOM)).toBe(1.5);
  });
  it("keeps what is under the fingers under them", () => {
    // 60 px into the view, nothing scrolled, zoom 1 to 2: that spot is now at 120, so scroll 60.
    expect(anchorScroll(0, 60, 1, 2)).toBe(60);
    expect(anchorScroll(100, 50, 2, 1)).toBe(25);
    expect(anchorScroll(0, 60, 2, 1)).toBe(0);
  });
  it("says the zoom, and nothing at 1:1", () => {
    expect(zoomLabel(1, 1)).toBeNull();
    expect(zoomLabel(2, 1)).toBe("time 2x");
    expect(zoomLabel(1.25, 1.5)).toBe("time 1.3x · pitch 1.5x");
  });
});
