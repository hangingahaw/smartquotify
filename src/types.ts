/** Options for the smartquotify transform */
export interface SmartQuotifyOptions {
  /** Convert prime marks for measurements (e.g. 6'2" → 6′2″). Default: true */
  primes?: boolean
  /** Skip HTML tag syntax and comments (protects attribute values like href="url"). Default: false */
  html?: boolean
  /** Skip Markdown code blocks, inline code, and link URLs. Default: false */
  markdown?: boolean
}

/** Cleanup function returned by smartquotifyInput */
export type CleanupFn = () => void
