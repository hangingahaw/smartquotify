import { rules } from './rules.js'
import type { SmartQuotifyOptions } from './types.js'

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

  const { primes = true } = options

  // Start index: skip prime rules (first 3) if primes disabled
  const startIdx = primes ? 0 : 3

  let result = text
  for (let i = startIdx; i < rules.length; i++) {
    const [pattern, replacement] = rules[i]
    // Reset lastIndex for global regexes (they're reused across calls)
    pattern.lastIndex = 0
    result = result.replace(pattern, replacement as string)
  }

  return result
}
