import { describe, it, expect } from 'vitest'
import { smartquotify } from '../src/core'

// Unicode constants for readability
const LDQ = '\u201C' // "
const RDQ = '\u201D' // "
const LSQ = '\u2018' // '
const RSQ = '\u2019' // '
const PRIME = '\u2032' // ′
const DPRIME = '\u2033' // ″

describe('smartquotify', () => {
  // ── Basic double quotes ──────────────────────────────────────────────

  describe('double quotes', () => {
    it('converts a simple quoted phrase', () => {
      expect(smartquotify('"hello"')).toBe(`${LDQ}hello${RDQ}`)
    })

    it('converts quoted phrase in a sentence', () => {
      expect(smartquotify('He said "hello" to her.')).toBe(
        `He said ${LDQ}hello${RDQ} to her.`,
      )
    })

    it('converts multiple quoted phrases', () => {
      expect(smartquotify('"one" and "two"')).toBe(
        `${LDQ}one${RDQ} and ${LDQ}two${RDQ}`,
      )
    })

    it('handles quote at start of input', () => {
      expect(smartquotify('"The court held')).toBe(`${LDQ}The court held`)
    })

    it('handles quote at end of input', () => {
      expect(smartquotify('is unconstitutional."')).toBe(
        `is unconstitutional.${RDQ}`,
      )
    })

    it('handles empty double quotes', () => {
      const result = smartquotify('""')
      // Both should be some form of smart quote
      expect(result).not.toBe('""')
    })
  })

  // ── Basic single quotes / apostrophes ────────────────────────────────

  describe('apostrophes and single quotes', () => {
    it('converts contractions', () => {
      expect(smartquotify("don't")).toBe(`don${RSQ}t`)
      expect(smartquotify("it's")).toBe(`it${RSQ}s`)
      expect(smartquotify("can't")).toBe(`can${RSQ}t`)
      expect(smartquotify("won't")).toBe(`won${RSQ}t`)
      expect(smartquotify("wouldn't")).toBe(`wouldn${RSQ}t`)
    })

    it('handles Irish names', () => {
      expect(smartquotify("O'Brien v. Smith")).toBe(
        `O${RSQ}Brien v. Smith`,
      )
      expect(smartquotify("O'Malley")).toBe(`O${RSQ}Malley`)
    })

    it('handles possessives in entity names', () => {
      expect(smartquotify("McDonald's Corp.")).toBe(
        `McDonald${RSQ}s Corp.`,
      )
      expect(smartquotify("Macy's, Inc. v. Doe")).toBe(
        `Macy${RSQ}s, Inc. v. Doe`,
      )
    })

    it('handles possessive after s', () => {
      expect(smartquotify("the plaintiffs' motion")).toBe(
        `the plaintiffs${RSQ} motion`,
      )
    })
  })

  // ── Abbreviated years ────────────────────────────────────────────────

  describe('abbreviated years', () => {
    it('converts abbreviated years to apostrophe (not opening quote)', () => {
      expect(smartquotify("the '08 financial crisis")).toBe(
        `the ${RSQ}08 financial crisis`,
      )
      expect(smartquotify("class of '92")).toBe(`class of ${RSQ}92`)
      expect(smartquotify("the '90s")).toBe(`the ${RSQ}90s`)
    })
  })

  // ── Patent/IP shorthand (CRITICAL legal edge case) ───────────────────

  describe('patent number shorthand', () => {
    it('converts patent numbers to apostrophe (not opening quote)', () => {
      expect(smartquotify("the '604 patent")).toBe(
        `the ${RSQ}604 patent`,
      )
      expect(smartquotify("the '337 investigation")).toBe(
        `the ${RSQ}337 investigation`,
      )
      expect(smartquotify("the '821 patent claims")).toBe(
        `the ${RSQ}821 patent claims`,
      )
    })

    it('handles multiple patent references', () => {
      expect(smartquotify("the '604 and '821 patents")).toBe(
        `the ${RSQ}604 and ${RSQ}821 patents`,
      )
    })
  })

  // ── Leading contractions ─────────────────────────────────────────────

  describe('leading contractions', () => {
    it("handles 'twas, 'tis, 'em, 'til", () => {
      expect(smartquotify("'twas the night")).toBe(
        `${RSQ}twas the night`,
      )
      expect(smartquotify("'tis the season")).toBe(
        `${RSQ}tis the season`,
      )
      expect(smartquotify("give 'em hell")).toBe(
        `give ${RSQ}em hell`,
      )
      expect(smartquotify("wait 'til tomorrow")).toBe(
        `wait ${RSQ}til tomorrow`,
      )
    })
  })

  // ── Prime marks (measurements) ───────────────────────────────────────

  describe('prime marks', () => {
    it('converts feet and inches', () => {
      expect(smartquotify('6\'2"')).toBe(`6${PRIME}2${DPRIME}`)
    })

    it('converts feet only', () => {
      expect(smartquotify("100' setback")).toBe(`100${PRIME} setback`)
    })

    it('converts in measurement context', () => {
      expect(smartquotify('the 5\'10" suspect')).toBe(
        `the 5${PRIME}10${DPRIME} suspect`,
      )
    })

    it('skips primes when option is disabled', () => {
      const result = smartquotify('6\'2"', { primes: false })
      expect(result).not.toContain(PRIME)
      expect(result).not.toContain(DPRIME)
    })
  })

  // ── Contract defined terms ───────────────────────────────────────────

  describe('contract defined terms', () => {
    it('converts defined terms in parentheses', () => {
      expect(smartquotify('(the "Seller")')).toBe(
        `(the ${LDQ}Seller${RDQ})`,
      )
      expect(smartquotify('(hereinafter "Agreement")')).toBe(
        `(hereinafter ${LDQ}Agreement${RDQ})`,
      )
    })

    it('converts "means" definitions', () => {
      expect(
        smartquotify('"Force Majeure" means any event'),
      ).toBe(`${LDQ}Force Majeure${RDQ} means any event`)
    })

    it('handles defined terms with "the" prefix', () => {
      expect(
        smartquotify('ABC Corp. (the "Buyer") hereby agrees'),
      ).toBe(`ABC Corp. (the ${LDQ}Buyer${RDQ}) hereby agrees`)
    })
  })

  // ── Em dash contexts ─────────────────────────────────────────────────

  describe('em dash + quotes', () => {
    it('opens quote after em dash', () => {
      expect(
        smartquotify('the court\u2014"in its discretion"\u2014ruled'),
      ).toBe(
        `the court\u2014${LDQ}in its discretion${RDQ}\u2014ruled`,
      )
    })

    it('opens single quote after em dash', () => {
      expect(
        smartquotify("power\u2014'if any'\u2014shall be"),
      ).toBe(
        `power\u2014${LSQ}if any${RSQ}\u2014shall be`,
      )
    })
  })

  // ── Nested quotes ────────────────────────────────────────────────────

  describe('nested quotes', () => {
    it('handles double inside text with single', () => {
      expect(smartquotify('"He said, \'I object.\'"')).toBe(
        `${LDQ}He said, ${LSQ}I object.${RSQ}${RDQ}`,
      )
    })
  })

  // ── Legal ellipses ───────────────────────────────────────────────────

  describe('legal ellipses', () => {
    it('preserves quotes around spaced ellipsis', () => {
      expect(
        smartquotify('"The court held . . . that"'),
      ).toBe(`${LDQ}The court held . . . that${RDQ}`)
    })

    it('handles brackets with ellipsis inside quotes', () => {
      expect(
        smartquotify('"[T]he defendant . . . argued"'),
      ).toBe(`${LDQ}[T]he defendant . . . argued${RDQ}`)
    })
  })

  // ── Brackets in quoted material ──────────────────────────────────────

  describe('brackets in quotes', () => {
    it('handles [T]he capitalization pattern', () => {
      const result = smartquotify('"[T]he statute applies."')
      expect(result).toBe(`${LDQ}[T]he statute applies.${RDQ}`)
    })

    it('handles [sic] inside quotes', () => {
      expect(
        smartquotify('"The defendent [sic] filed a motion."'),
      ).toBe(
        `${LDQ}The defendent [sic] filed a motion.${RDQ}`,
      )
    })
  })

  // ── Edge cases ───────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('returns empty string for empty input', () => {
      expect(smartquotify('')).toBe('')
    })

    it('returns same string if no quotes', () => {
      expect(smartquotify('No quotes here.')).toBe('No quotes here.')
    })

    it('is idempotent (running twice produces same result)', () => {
      const input = '"Don\'t stop the \'604 patent" and 6\'2"'
      const once = smartquotify(input)
      const twice = smartquotify(once)
      expect(twice).toBe(once)
    })

    it('handles accented characters near quotes', () => {
      expect(smartquotify('"café"')).toBe(`${LDQ}café${RDQ}`)
    })

    it('handles quotes after newlines', () => {
      expect(smartquotify('line one\n"line two"')).toBe(
        `line one\n${LDQ}line two${RDQ}`,
      )
    })

    it('handles quote after colon', () => {
      expect(
        smartquotify('The court held: "The statute is unconstitutional."'),
      ).toBe(
        `The court held: ${LDQ}The statute is unconstitutional.${RDQ}`,
      )
    })

    it('preserves already-smart quotes', () => {
      const smart = `${LDQ}already smart${RDQ}`
      expect(smartquotify(smart)).toBe(smart)
    })
  })

  // ── LLM output scenarios ─────────────────────────────────────────────

  describe('LLM output scenarios', () => {
    it('converts a typical LLM response paragraph', () => {
      const input =
        'The court in O\'Brien v. Smith held that "due process requires notice." The \'604 patent\'s claims were found invalid.'
      const result = smartquotify(input)
      expect(result).toContain(LDQ)
      expect(result).toContain(RDQ)
      expect(result).toContain(`O${RSQ}Brien`)
      expect(result).toContain(`${RSQ}604`)
    })

    it('handles mixed content from AI', () => {
      const input =
        'According to the brief, "the defendant\'s \'reasonable expectation\' was not met." The 5\'10" officer testified.'
      const result = smartquotify(input)
      expect(result).toContain(`defendant${RSQ}s`)
      expect(result).toContain(`5${PRIME}10${DPRIME}`)
    })
  })
})
