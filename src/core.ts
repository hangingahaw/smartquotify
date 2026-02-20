import { rules } from './rules.js'
import type { SmartQuotifyOptions } from './types.js'

/** A segment of text that is either protected (skip) or transformable */
interface Zone {
  text: string
  skip: boolean
}

/**
 * Split input into protected zones (skip) and text zones (transform).
 *
 * Protected zones for html mode:
 *   - HTML tags: <...> (protects attribute values like href="url")
 *   - HTML comments: <!-- ... -->
 *
 * Protected zones for markdown mode:
 *   - Fenced code blocks: ```...```
 *   - Inline code: `...`
 *   - Link/image URLs: [text](url) — the (url) part only
 *   - Autolinks: <https://...>
 */
function splitProtectedZones(
  text: string,
  options: SmartQuotifyOptions,
): Zone[] {
  const patterns: RegExp[] = []

  if (options.html) {
    patterns.push(
      // HTML comments
      /<!--[\s\S]*?-->/g,
      // HTML tags (opening, closing, self-closing)
      /<\/?[a-zA-Z][^>]*>/g,
    )
  }

  if (options.markdown) {
    patterns.push(
      // Fenced code blocks (``` or ~~~)
      /(`{3,}|~{3,})[\s\S]*?\1/g,
      // Inline code (backticks)
      /`[^`]+`/g,
      // Link/image URLs: capture [text](url) — skip the (url) part
      // We handle this specially below
    )
  }

  if (patterns.length === 0) return [{ text, skip: false }]

  // Build a combined pattern with alternation
  // For markdown link URLs we need special handling: transform [text] but skip (url)
  const allPatterns: RegExp[] = [...patterns]
  if (options.markdown) {
    // Match the full [text](url) so we can split it into text + url parts
    allPatterns.push(/!?\[([^\]]*)\]\([^)]*\)/g)
    // Autolinks: <http...> or <https...>
    allPatterns.push(/<https?:\/\/[^>]+>/g)
  }

  // Find all protected ranges
  interface Range {
    start: number
    end: number
    /** For markdown links, we have sub-ranges to transform */
    subTransform?: { start: number; end: number }[]
  }

  const ranges: Range[] = []

  for (const pattern of allPatterns) {
    pattern.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = pattern.exec(text)) !== null) {
      const full = match[0]
      const start = match.index
      const end = start + full.length

      // Check if this is a markdown link: [text](url)
      if (
        options.markdown &&
        (full.startsWith('[') || full.startsWith('![')) &&
        full.includes('](')
      ) {
        const bracketStart = full.indexOf('[')
        const bracketEnd = full.indexOf('](')
        // The text inside [] should be transformed
        ranges.push({
          start,
          end,
          subTransform: [
            {
              start: start + bracketStart + 1,
              end: start + bracketEnd,
            },
          ],
        })
      } else {
        ranges.push({ start, end })
      }
    }
  }

  if (ranges.length === 0) return [{ text, skip: false }]

  // Sort by start position and merge overlapping ranges
  ranges.sort((a, b) => a.start - b.start)
  const merged: Range[] = [ranges[0]]
  for (let i = 1; i < ranges.length; i++) {
    const prev = merged[merged.length - 1]
    const curr = ranges[i]
    if (curr.start <= prev.end) {
      // Overlapping — extend
      if (curr.end > prev.end) {
        prev.end = curr.end
      }
      // Merge subTransform arrays
      if (curr.subTransform) {
        prev.subTransform = (prev.subTransform || []).concat(
          curr.subTransform,
        )
      }
    } else {
      merged.push(curr)
    }
  }

  // Build zones
  const zones: Zone[] = []
  let pos = 0

  for (const range of merged) {
    // Text before this protected range
    if (range.start > pos) {
      zones.push({ text: text.slice(pos, range.start), skip: false })
    }

    if (range.subTransform && range.subTransform.length > 0) {
      // This range has sub-sections to transform (e.g. markdown link text)
      let subPos = range.start
      for (const sub of range.subTransform) {
        if (sub.start > subPos) {
          zones.push({ text: text.slice(subPos, sub.start), skip: true })
        }
        zones.push({ text: text.slice(sub.start, sub.end), skip: false })
        subPos = sub.end
      }
      if (subPos < range.end) {
        zones.push({ text: text.slice(subPos, range.end), skip: true })
      }
    } else {
      zones.push({ text: text.slice(range.start, range.end), skip: true })
    }

    pos = range.end
  }

  // Remaining text after last protected range
  if (pos < text.length) {
    zones.push({ text: text.slice(pos), skip: false })
  }

  return zones
}

/** Apply the quote-conversion rules to a plain text string */
function applyRules(text: string, options: SmartQuotifyOptions): string {
  if (!text) return text

  const { primes = true } = options
  const startIdx = primes ? 0 : 3

  let result = text
  for (let i = startIdx; i < rules.length; i++) {
    const [pattern, replacement] = rules[i]
    pattern.lastIndex = 0
    result = result.replace(pattern, replacement as string)
  }

  return result
}

/**
 * Convert straight quotes to smart/curly quotes.
 *
 * Handles double quotes, single quotes, apostrophes, contractions,
 * abbreviated years, patent number shorthand, prime marks for
 * measurements, em-dash contexts, and nested quotes.
 *
 * @param text - Input string with straight quotes
 * @param options - Optional configuration
 * @returns String with smart quotes
 */
export function smartquotify(
  text: string,
  options: SmartQuotifyOptions = {},
): string {
  if (!text) return text

  const { html, markdown } = options

  if (!html && !markdown) {
    return applyRules(text, options)
  }

  const zones = splitProtectedZones(text, options)
  return zones
    .map((zone) => (zone.skip ? zone.text : applyRules(zone.text, options)))
    .join('')
}
