import { smartquotify } from './core.js'
import { saveCursor, restoreCursor } from './cursor.js'
import type { CleanupFn, SmartQuotifyOptions } from './types.js'

/**
 * Attach live smart-quote conversion to an input, textarea, or
 * contenteditable element. Returns a cleanup function to detach.
 *
 * @param element - The DOM element to enhance
 * @param options - Optional smartquotify options
 * @returns Cleanup function to remove the listener
 */
export function smartquotifyInput(
  element: HTMLElement,
  options?: SmartQuotifyOptions,
): CleanupFn {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return attachToInput(element, options)
  }

  if (element.isContentEditable) {
    return attachToContentEditable(element, options)
  }

  throw new Error(
    'smartquotifyInput: element must be an input, textarea, or contenteditable element',
  )
}

function attachToInput(
  el: HTMLInputElement | HTMLTextAreaElement,
  options?: SmartQuotifyOptions,
): CleanupFn {
  const handler = () => {
    const cursorPos = saveCursor(el)
    const oldValue = el.value
    const newValue = smartquotify(oldValue, options)

    if (newValue !== oldValue) {
      el.value = newValue
      restoreCursor(el, cursorPos, oldValue.length, newValue.length)
    }
  }

  el.addEventListener('input', handler)
  return () => el.removeEventListener('input', handler)
}

function attachToContentEditable(
  el: HTMLElement,
  options?: SmartQuotifyOptions,
): CleanupFn {
  const handler = () => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return

    const oldText = el.textContent ?? ''
    const newText = smartquotify(oldText, options)

    if (newText !== oldText) {
      // Save cursor offset within the element
      const range = sel.getRangeAt(0)
      const offset = range.startOffset
      const delta = newText.length - oldText.length

      el.textContent = newText

      // Restore cursor
      try {
        const newRange = document.createRange()
        const textNode = el.firstChild
        if (textNode) {
          const newOffset = Math.max(0, Math.min(offset + delta, newText.length))
          newRange.setStart(textNode, newOffset)
          newRange.collapse(true)
          sel.removeAllRanges()
          sel.addRange(newRange)
        }
      } catch {
        // Cursor restoration is best-effort
      }
    }
  }

  el.addEventListener('input', handler)
  return () => el.removeEventListener('input', handler)
}
