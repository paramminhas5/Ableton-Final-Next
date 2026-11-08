import { describe, expect, it } from "vitest";
import INDEX from "../src/content/lessonIndex.gen.json";
import { buildIndex } from "../src/lib/lessonInfo";

describe("lesson index", () => {
  it("matches the lesson content (run npm run lessons after changing a lesson)", () => {
    expect(JSON.parse(JSON.stringify(buildIndex()))).toEqual(INDEX);
  });
});
