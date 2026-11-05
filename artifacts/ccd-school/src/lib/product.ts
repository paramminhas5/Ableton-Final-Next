/**
 * The product's name, in one place.
 *
 * School is one of the four Cats Can Dance products. Its working name is Ustad: the
 * honorific for the master musician who teaches, and in everyday Hindi, the pro. We
 * wear it with a wink and never claim it. Everything a person reads (chrome, titles,
 * metadata, the sign-in and welcome screens) takes the name from here, so renaming is
 * one edit. Code identifiers, env vars, database rows, package names and lesson content
 * keep their old names: a learner's saved data must not depend on what we call the app.
 */

/** The name people see. Lowercase in the UI, as every engraved label is. */
export const PRODUCT_NAME = "Ustad";

/** True while the name is still a working name; copy can soften around it. */
export const PRODUCT_WORKING_NAME = true;

/** One line that says what the product is. The banner shows it on desktop. */
export const PRODUCT_PROMISE = "Learn production and DJing by making real music on a real instrument.";

/** Where the product lives. The site URL env var still wins for metadata (see lib/ccd.ts). */
export const PRODUCT_URL = "https://school.catscandance.com";

/** Whose product it is. The footer says so on every page. */
export const PRODUCT_PARENT = "Cats Can Dance";

/**
 * Nicknames, for copy only, never for chrome or titles.
 * The Big Cat is the teacher's voice. Riyaz is daily practice, the word musicians use.
 */
export const NICKNAMES = {
  teacher: "the Big Cat",
  practice: "riyaz",
} as const;

/** The name as the UI prints it: lowercase, like every engraved label on the instrument. */
export const PRODUCT_NAME_LOWER = PRODUCT_NAME.toLowerCase();

/** "Ustad, by Cats Can Dance", for places that need the full line. */
export const PRODUCT_BYLINE = `${PRODUCT_NAME}, by ${PRODUCT_PARENT}`;

/** The browser title: "Ustad | learn music production and djing". */
export const PRODUCT_TITLE = `${PRODUCT_NAME} | learn music production and djing`;
