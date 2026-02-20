/** Options for the smartquotify transform */
export interface SmartQuotifyOptions {
  /** Convert prime marks for measurements (e.g. 6'2" → 6′2″). Default: true */
  primes?: boolean
}

/** Cleanup function returned by smartquotifyInput */
export type CleanupFn = () => void
