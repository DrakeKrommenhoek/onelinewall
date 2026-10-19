import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
} from "obscenity";

// A basic filter, not a perfect one. It catches slurs and profanity (including l33t-speak and
// spaced-out spellings), links, and contact info. Anything that slips through can be reported
// by students or hidden from /admin.

const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

const URL_RE = /\b(?:https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.(?:com|net|org|io|gg|ly|co|xyz|app|me|tv)\b/i;
const EMAIL_RE = /[^\s@]+@[^\s@]+\.[a-z]{2,}/i;
const PHONE_RE = /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/;
// Control characters, zero-width characters, and bidi overrides.
const INVISIBLE_RE = new RegExp(
  `[${[
    [0x00, 0x1f],
    [0x7f, 0x9f],
    [0x200b, 0x200f],
    [0x2028, 0x202e],
    [0x2060, 0x206f],
    [0xfeff, 0xfeff],
  ]
    .map(([a, b]) => `${String.fromCharCode(a)}-${String.fromCharCode(b)}`)
    .join("")}]`,
  "g",
);

export type ModerationResult = { ok: true; text: string } | { ok: false; reason: string };

/** Trim, collapse whitespace, and strip invisible characters. */
export function tidy(input: string): string {
  return input.replace(INVISIBLE_RE, "").replace(/\s+/g, " ").trim();
}

/** Normalized form used to catch duplicate pitches ("Favorite movie!" == "favorite  movie"). */
export function fingerprint(input: string): string {
  return tidy(input)
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// "f u c k" and "f.u.c.k" -> "fuck", so spaced-out spellings get checked too.
function collapseSpacedLetters(text: string): string {
  return text.replace(/\b(?:[a-z0-9][\s._*-]+){2,}[a-z0-9]\b/gi, (m) => m.replace(/[\s._*-]+/g, ""));
}

export function hasBlockedLanguage(text: string): boolean {
  return matcher.hasMatch(text) || matcher.hasMatch(collapseSpacedLetters(text));
}

export function moderate(
  input: unknown,
  { min = 3, max = 120, field = "pitch" }: { min?: number; max?: number; field?: string } = {},
): ModerationResult {
  if (typeof input !== "string") return { ok: false, reason: `Your ${field} is missing.` };
  const text = tidy(input);
  if (text.length < min) return { ok: false, reason: `Your ${field} is a little short.` };
  if (text.length > max) return { ok: false, reason: `Keep your ${field} under ${max} characters.` };
  if (hasBlockedLanguage(text)) {
    return {
      ok: false,
      reason: "That one won't go on the wall. Keep it to something you'd write in the Commons.",
    };
  }
  if (URL_RE.test(text)) return { ok: false, reason: "No links, please." };
  if (EMAIL_RE.test(text) || PHONE_RE.test(text)) {
    return { ok: false, reason: "Leave contact info off the wall." };
  }
  if (/(.)\1{7,}/.test(text)) return { ok: false, reason: "Ease up on the repeated letters." };
  return { ok: true, text };
}
