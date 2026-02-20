import { useState, useCallback, useRef, type ChangeEvent, type RefCallback } from 'react'
import { smartquotify } from '../core.js'
import type { SmartQuotifyOptions } from '../types.js'

/**
 * React hook for controlled inputs with smart quote conversion.
 *
 * @param initialValue - Starting value for the input
 * @param options - Optional smartquotify options
 * @returns Object with value, onChange handler, and ref callback
 */
export function useSmartQuotify(
  initialValue = '',
  options?: SmartQuotifyOptions,
) {
  const [value, setValue] = useState(() => smartquotify(initialValue, options))
  const elRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

  const ref: RefCallback<HTMLInputElement | HTMLTextAreaElement> = useCallback(
    (node) => {
      elRef.current = node
    },
    [],
  )

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const raw = e.target.value
      const converted = smartquotify(raw, options)
      setValue(converted)

      // Restore cursor position after React commits the new value
      if (elRef.current && converted !== raw) {
        const el = elRef.current
        const cursorPos = el.selectionStart ?? raw.length
        const delta = converted.length - raw.length
        const newPos = Math.max(0, Math.min(cursorPos + delta, converted.length))

        queueMicrotask(() => {
          el.setSelectionRange(newPos, newPos)
        })
      }
    },
    [options],
  )

  return { value, onChange, ref }
}
