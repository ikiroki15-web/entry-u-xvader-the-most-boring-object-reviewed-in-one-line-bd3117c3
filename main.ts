/**
 * The Most Boring Object, Reviewed in One Line
 *
 * Writes a single review line to /output/entry.txt.
 *
 * Chosen object: the pencil eraser. It is about as boring and everyday as
 * an object gets, and its one honest trait is that using it destroys it:
 * every mistake it fixes costs it a little of itself, until one day it is
 * just a metal sleeve holding a crumb. That is the joke, and it is true.
 *
 * The line is assembled from named parts so each piece earns its place,
 * then validated before anything is written to disk.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

// ---------------------------------------------------------------------------
// Limits from the competition gate
// ---------------------------------------------------------------------------

const MAX_CHARS = 200;
const MIN_CHARS = 1;
const OUTPUT_PATH = "/output/entry.txt";

// ---------------------------------------------------------------------------
// The review, built from parts
// ---------------------------------------------------------------------------

interface ReviewParts {
  /** The object, named plainly. */
  subject: string;
  /** What it does, stated as a plain fact. */
  setup: string;
  /** The turn: the true behaviour that makes it funny. */
  twist: string;
}

/**
 * Joins the parts into one line. The subject leads, the setup states the
 * fact, and the twist lands last so the final words sharpen the joke.
 * Runs of whitespace inside a part are collapsed first, so the joined
 * line can never carry a double space or a stray tab from an edit.
 */
function composeReview(parts: ReviewParts): string {
  const segments = [parts.subject, parts.setup, parts.twist];
  const cleaned = segments.map((segment) =>
    segment.trim().replace(/\s+/g, " "),
  );
  return cleaned.join(" ");
}

/**
 * The review itself. The eraser's tragedy is mechanical, not invented:
 * it erases by shedding itself, so the harder it works the less of it
 * there is.
 */
function buildReview(): string {
  return composeReview({
    subject: "The eraser:",
    setup: "it fixes your mistakes by slowly disappearing itself,",
    twist: "the only tool that gets smaller the harder it works.",
  });
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

interface ValidationResult {
  ok: boolean;
  problems: string[];
}

/**
 * Checks the line against every rule in the gate: 1-200 characters, not
 * only whitespace, exactly one line, and plain UTF-8 text with no control
 * characters hiding inside it.
 */
function validateLine(line: string): ValidationResult {
  const problems: string[] = [];

  if (line.length < MIN_CHARS) {
    problems.push(`line is empty (needs at least ${MIN_CHARS} character)`);
  }
  if (line.length > MAX_CHARS) {
    problems.push(
      `line is ${line.length} characters, over the ${MAX_CHARS} limit`,
    );
  }
  if (line.trim().length === 0) {
    problems.push("line is only whitespace");
  }
  if (/[\r\n]/.test(line)) {
    problems.push("line contains a line break, so it is not one line");
  }
  // Reject stray control characters (tabs, bells, escapes) that would
  // look like junk in the output file.
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(line)) {
    problems.push("line contains control characters");
  }
  // The gate counts characters; a surrogate-pair character would count
  // as two in JS but one on screen. Keep the line plain ASCII so the two
  // counts can never disagree.
  if (/[^\x00-\x7F]/.test(line)) {
    problems.push("line contains non-ASCII characters");
  }

  return { ok: problems.length === 0, problems };
}

/** Counts characters the way the gate does: plain string length. */
function charCount(line: string): number {
  return line.length;
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

/**
 * Writes the line to /output/entry.txt, creating the directory first.
 * Writes the line with no trailing newline and no extra bytes, so the
 * file is exactly the review and nothing else.
 */
function writeEntry(line: string, outputPath: string): void {
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, line, { encoding: "utf8", flag: "w" });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const line = buildReview();
  const check = validateLine(line);

  if (!check.ok) {
    for (const problem of check.problems) {
      console.error(`FAIL: ${problem}`);
    }
    console.error(`Line was: ${JSON.stringify(line)}`);
    process.exit(1);
  }

  writeEntry(line, OUTPUT_PATH);

  console.log(`Wrote ${OUTPUT_PATH}`);
  console.log(`Review: ${line}`);
  console.log(`Characters: ${charCount(line)} / ${MAX_CHARS}`);
  console.log(`Output path: ${join(OUTPUT_PATH)}`);
}

main();
