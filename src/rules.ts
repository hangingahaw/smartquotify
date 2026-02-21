/**
 * Ordered regex replacement rules for smart quote conversion.
 *
 * Rule order matters:
 *   1. Prime marks (measurements) — must come before generic quote rules
 *   2. Leading apostrophes (contractions, years, patent numbers)
 *   3. Double quotes (opening/closing)
 *   4. Single quotes (apostrophes, then opening/closing)
 */

// Unicode characters
const LDQ = '\u201C' // " left double quotation mark
const RDQ = '\u201D' // " right double quotation mark
const LSQ = '\u2018' // ' left single quotation mark
const RSQ = '\u2019' // ' right single quotation mark (also apostrophe)
const PRIME = '\u2032' // ′ prime (feet)
const DPRIME = '\u2033' // ″ double prime (inches)

export type Rule = [RegExp, string | ((...args: string[]) => string)]

export const rules: Rule[] = [
  // ── PRIME MARKS (measurements like 6'2", 100') ──────────────────────
  // digit + ' + digit + " (feet and inches: 6'2")
  [/(\d)'(\d+)"/g, `$1${PRIME}$2${DPRIME}`],
  // digit + ' (feet only: 100')
  // Negative lookbehind: skip number ranges like 10-20' where ' is a closing quote, not feet
  [/(\d)'(?<![-\u2013\u2014]\d+')/g, `$1${PRIME}`],
  // digit + " (inches only, standalone: 12")
  // Negative lookbehind: skip number ranges like 10-20" where " is a closing quote, not inches
  [/(\d)"(?<![-\u2013\u2014]\d+")/g, `$1${DPRIME}`],

  // ── LEADING APOSTROPHES (must come before generic single-quote rules) ──
  // Patent/year shorthand: space/start + ' + digits (the '604 patent, the '90s, class of '92)
  [/(^|\s)'(\d)/gm, `$1${RSQ}$2`],

  // Known leading contractions: 'twas, 'tis, 'em, 'til, 'cause, 'bout, 'n'
  [/(^|\s)'(twas|tis|em|til|cause|bout|n)\b/gim, `$1${RSQ}$2`],

  // ── DOUBLE QUOTES ───────────────────────────────────────────────────

  // Opening double quote: after start-of-string, whitespace, opening punctuation, em dash, en dash, or double hyphen
  // Covers: "hello, ("Seller"), —"in its discretion", ["the court"]
  [/(^|[\s(\[{—\u2013]|--)"(?=\S)/gm, `$1${LDQ}`],

  // Closing double quote: before end-of-string, whitespace, closing punctuation, em dash, en dash, double hyphen, or after punctuation/letter
  // The quote follows a non-space character
  [/(\S)"(?=[\s)\]};:,.!?\u2014\u2013—]|--|$)/gm, `$1${RDQ}`],

  // Catch remaining double quotes: if preceded by non-space, it's closing; otherwise opening
  [/(\S)"/g, `$1${RDQ}`],
  [/"(\S)/g, `${LDQ}$1`],
  // Bare remaining " (e.g. empty quotes "") — treat as opening
  [/"/g, LDQ],

  // ── SINGLE QUOTES (apostrophes vs. open/close) ─────────────────────

  // Mid-word apostrophe: letter + ' + letter (don't, O'Brien, it's)
  [/(\w)'(\w)/g, `$1${RSQ}$2`],

  // Possessive after s: s + ' + space/punctuation/end (plaintiffs' motion)
  [/(s)'(?=[\s)\]};:,.!?]|$)/gi, `$1${RSQ}`],

  // Closing single quote after letter/punctuation: precedes space, punctuation, or end
  [/(\S)'(?=[\s)\]};:,.!?\u2014\u2013—]|--|$)/gm, `$1${RSQ}`],

  // Opening single quote: after start, whitespace, opening punctuation, em dash
  [/(^|[\s(\[{—\u2013]|--)'(?=\S)/gm, `$1${LSQ}`],

  // Catch remaining single quotes: if preceded by non-space, closing; otherwise opening
  [/(\S)'/g, `$1${RSQ}`],
  [/'(\S)/g, `${LSQ}$1`],
  [/'/g, RSQ],
]
