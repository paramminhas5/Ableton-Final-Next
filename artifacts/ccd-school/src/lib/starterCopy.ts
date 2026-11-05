/** Lesson copy says "your song is playing"; with an empty song that is a starter loop, so say so. */
export function starterCopy(text: string) {
  return text
    .replace(/Your song is playing with your (\w+) in it/g, "A starter loop is playing, with $1 in it")
    .replace(/Your song is playing/g, "A starter loop is playing")
    .replace(/your song is playing/g, "a starter loop is playing");
}
