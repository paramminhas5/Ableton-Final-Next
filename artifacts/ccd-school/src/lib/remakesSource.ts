/**
 * Where the remakes screen gets its list. Until src/lib/remakes.ts (the engine agent's) is on the branch this
 * re-exports the stand-in with the same shape (src/lib/remakesStub.ts); then it maps the real list here.
 */
export { REMAKES, type Remake } from "./remakesStub";
